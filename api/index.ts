import { PrismaClient, TransportType } from '@prisma/client';
import { CreateComment, CreateReview, CreateUser, DownvoteReview, GetAllReview, GetReviewById, GetUserById, GetUserByName, GetUsers, RemoveDownvoteReview, RemoveUpvoteReview, UpvoteReview, GetRoute, SearchRoutes, GetUserProfileById, ChangePassword} from '../service/datebaseAction';
import express from 'express';
import { createToken, removeToken, VerifyToken } from '../service/auth';
import { TransformLocationToServer, TransformReviewDetails, TransformReviewOverview } from '../service/transform';
import { uploadImage } from '../service/imageServer';import { v2 as cloudinary } from 'cloudinary';
import { aiQuery, checkToken, updateSummary } from '../service/ai';
import { waitUntil } from '@vercel/functions';

cloudinary.config({ 
  cloud_name: '', 
  api_key: '', 
  api_secret: '' 
});


const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get("/", async (req, res) => {
  const result = await GetUsers()
  res.send(result)
});

const Authenticate = async (req, res, next) => {


  if (!req.headers.authorization){
    res.locals.vrfy_result={
      status:"NO_TOKEN_FOUND",
      uuid: null
    }
    next()
    return
  }
  const token = req.headers.authorization.split(' ')[1]
  console.log("token:", token)
  

  console.log("token exist")
  const result = await VerifyToken(token)
  console.log( result)
  res.locals.vrfy_result=result
  next()
}

app.post("/login", async (req, res) => {
  const user = await GetUserByName(req.body.username)
  if (!user) {
    //throw new Error("No such user")
    res.send({status: "No Such User"})
    return
  }
  if (user.password != req.body.password) {
    //throw new Error("Wrong Password")
    res.send({status: "Wrong Password"})
    return
  }

  const token = createToken(user.uuid)
  console.log(token)


  const userProfile= await GetUserProfileById(user.uuid)
  const response = {
    status: "SUCCESS",
    token: token,
    userProfile: userProfile
  }

  res.send(response)
});

app.post("/vrfy", Authenticate , async (req, res) => {
  if (!res.locals.vrfy_result.uuid){
    res.send({
      status: res.locals.vrfy_result.status
    });
    return
  }

  const userProfile= await GetUserProfileById(res.locals.vrfy_result.uuid)
  if (!userProfile) {
    //throw new Error("No such user")
    res.send("No such user")
    return
  }

  const response = {
    status: res.locals.vrfy_result.status,
    userProfile: userProfile
  }

  res.send(response)
});

app.post("/logout", Authenticate, async (req, res) => {
  if (!res.locals.vrfy_result.uuid){
    res.send(res.locals.vrfy_result.status);
    return;
  }
  const token = req.headers.authorization.split(' ')[1]
  console.log(token)
  await removeToken(token)

  res.send("Express on Hello2")
});

app.post("/register", async (req, res) => {
  const user = await GetUserByName(req.body.username);
  if (user) {
    res.send({status: "Username is already used"});
    return;
  }
  const result = await CreateUser(req.body.username, req.body.password);

  if (!result) {
    res.send({status: "Register Failed"});
    return;
  }
  const response = {
    status: "SUCCESS"
  };
  res.send(response);
});

app.post("/changepassword", Authenticate, async (req, res) => {
  if (!res.locals.vrfy_result.uuid){
    res.send({
      status: res.locals.vrfy_result.status
    });
    return
  }

  const user= await GetUserById(res.locals.vrfy_result.uuid)
  if (!user) {
    res.send({status:"No Such User"});
    return;
  }
  
  if (user.password != req.body.old_password) {
    res.send({status: "Wrong Password"})
    return
  }

  const updated_user = await ChangePassword(res.locals.vrfy_result.uuid, req.body.new_password)

  if (!updated_user) {
    res.send({status:"Change password failed. Please try again."});
    return;
  }

  const response = {
    status: "SUCCESS"
  };
  res.send(response)
});


app.get("/user", async (req, res) => {
  const result= await GetUserById(req.query.user_id as string)
  res.send(result)
});


app.get("/review", async (req, res) => {
  console.log(req.query.review_id)
  const review = await GetReviewById(parseInt(req.query.review_id as string))

  const reviewTransformed = TransformReviewDetails(review);

  const response = {
    status: "SUCCESS",
    review: reviewTransformed,
  }
  console.log("review detail page response: ",response)
  res.send(response)
})

app.get("/reviews", async (req, res) => {
  console.log(req.query.review_id);
  const reviews = await GetAllReview();
  const response = TransformReviewOverview(reviews);
  console.log("Get all reviews:", response )
  res.send(response);
});


app.get("/route", async (req, res) => {
  console.log(req.query.id, req.query.id)
  const {reviews, ...route_rest} = await GetRoute(parseInt(req.query.id as string))


  const reviews_transformed = reviews.map(({poster, downvotedBy, upvotedBy, ...rest}) => {  //move to another function
    return ({     
      posterName: poster.username,
      upvoteCount: upvotedBy.length,
      downvoteCount: downvotedBy.length,
      ...rest
    })
  })
  const response = {
    reviews: reviews_transformed,
    ...route_rest
  }

  res.send(response)
});

app.get("/routes", async (req, res) => {
  const routes = await SearchRoutes(" ");
  res.send(routes);
});


app.get("/search", async (req, res) => {
  console.log(req.query.search_query)
  const routes = await SearchRoutes(req.query.search_query as string);

  res.send(routes)
});

app.post("/createUser", async (req, res) => {
  await CreateUser(req.body.username, req.body.password)
  console.log(req.body.username, req.body.password)
  //await test.CreateUser("123", "234")
  res.send("Express on Hello2")
});

app.post("/createReview", Authenticate, async (req, res) => {
  if (!res.locals.vrfy_result.uuid){
    res.send(res.locals.vrfy_result.status);
    return
  }

  const poster= await GetUserById(res.locals.vrfy_result.uuid)
  if (!poster) {
    res.send("No such user")
    return
  }

  const urls = [];
  try {
    for (const image of req.body.images){
      const result = await cloudinary.uploader.upload("data:image/jpg;base64,"+image);
      console.log(result);
      urls.push(result.url);
    }
  } catch (error) {
    urls.splice(0,urls.length);
    console.error(error);
  }
  console.log(urls);
  
  
  const route = await CreateReview(req.body.title, req.body.content, req.body.rating, poster.uuid, req.body.type, req.body.route, urls, TransformLocationToServer(req.body.locations), req.body.registrationMark, req.body.driverIdentity)
  console.log(req.body.title, req.body.content, req.body.rating, poster.uuid, req.body.type, req.body.route, urls, TransformLocationToServer(req.body.locations), req.body.registrationMark, req.body.driverIdentity)
  
  if (req.body.updateSummary==true) console.log("update Summary")
  if (route && req.body.updateSummary) {
    waitUntil(updateSummary(route.id))
  }
  
  res.send("SUCCESS");
});

app.post("/upvote", Authenticate, async (req, res) => {
  if (!res.locals.vrfy_result.uuid){
    res.send({
      status:res.locals.vrfy_result.status
    });
    return;
  }

  const poster= await GetUserById(res.locals.vrfy_result.uuid)
  if (!poster) {
    //throw new Error("No such user");
    res.send({
      status:"No Such User"
    });
    return;
  }
  const review= await GetReviewById(req.body.review_id)
  if (!review) {
    //throw new Error("No such user");
    res.send({
      status:"No Such Review"
    });
    return;
  }  

  const response = {
    status:"SUCCESS",
    upvotedReviews: [],
    downvotedReviews: [],
    review: {}
  } 

  if (review.downvotedBy.find(i=>i.uuid===poster.uuid)){
    await RemoveDownvoteReview(poster.uuid, req.body.review_id);
  }

  if (review.upvotedBy.find(i=>i.uuid===poster.uuid)){
    console.log(review.upvotedBy.find(i=>i.uuid===poster.uuid));
    const {updated_review, updated_upvotedReviews, updated_downvotedReviews} = await RemoveUpvoteReview(poster.uuid, req.body.review_id);
    response.upvotedReviews = updated_upvotedReviews;
    response.downvotedReviews = updated_downvotedReviews;
    response.review = TransformReviewDetails(updated_review);
  } else {
    const {updated_review, updated_upvotedReviews, updated_downvotedReviews} = await UpvoteReview(poster.uuid, req.body.review_id);
    response.upvotedReviews = updated_upvotedReviews;
    response.downvotedReviews = updated_downvotedReviews;
    response.review = TransformReviewDetails(updated_review);
  }
  
  res.send(response);
});


app.post("/downvote", Authenticate, async (req, res) => {
  if (!res.locals.vrfy_result.uuid){
    res.send({
      status:res.locals.vrfy_result.status
    });
    return;
  }

  const poster= await GetUserById(res.locals.vrfy_result.uuid)
  if (!poster) {
    //throw new Error("No such user")
    res.send({
      status:"No Such User"
    });
    return;
  }
  const review= await GetReviewById(req.body.review_id)
  if (!review) {
    //throw new Error("No such user")
    res.send({
      status:"No Such Review"
    });
    return;
  }  


  const response = {
    status:"SUCCESS",
    upvotedReviews: [],
    downvotedReviews: [],
    review: {}
  } 

  if (review.upvotedBy.find(i=>i.uuid===poster.uuid)){
    await RemoveUpvoteReview(poster.uuid, req.body.review_id);
  }

  if (review.downvotedBy.find(i=>i.uuid===poster.uuid)){
    console.log(review.downvotedBy.find(i=>i.uuid===poster.uuid));
    const {updated_review, updated_upvotedReviews, updated_downvotedReviews} = await RemoveDownvoteReview(poster.uuid, req.body.review_id);
    response.downvotedReviews = updated_downvotedReviews;
    response.upvotedReviews = updated_upvotedReviews;
    response.review = TransformReviewDetails(updated_review);

  } else {
    const {updated_review, updated_upvotedReviews, updated_downvotedReviews} = await DownvoteReview(poster.uuid, req.body.review_id);
    response.downvotedReviews = updated_downvotedReviews;
    response.upvotedReviews = updated_upvotedReviews;
    response.review = TransformReviewDetails(updated_review);
  }
  
  res.send(response);
});


app.post("/createComment", Authenticate, async (req, res) => {
  
  if (!res.locals.vrfy_result.uuid){
    res.send(res.locals.vrfy_result.status);
    return
  }

  const poster= await GetUserById(res.locals.vrfy_result.uuid)
  if (!poster) {
    //throw new Error("No such user")
    res.send({
      status:"No Such User"
    })
    return
  }

  const review= await GetReviewById(req.body.review_id)
  if (!review) {
    res.send({
      status:"No Such Review"
    })
    return
  }

  const updated_review = await CreateComment(req.body.content, req.body.review_id, poster.uuid);

  const response = {
    status:"SUCCESS",
    review: {}
  } 
  response.review = TransformReviewDetails(updated_review);
  res.send(response);
});


app.post("/aiaiaiaiaiaiBRUH", async (req, res) => {
  
  const response = await aiQuery(req.body.content);
  res.send(response);
});

app.post("/aiToken", async (req, res) => {
  waitUntil(checkToken());
  res.send("response");
  console.log("hi")
});

app.post("/aiSummary", async (req, res) => {
  
  const response = await updateSummary(req.body.id);
  res.send(response);
});


app.listen(8088, () => console.log("Server ready on port 8088."));

module.exports = app;