import { Review } from '@prisma/client';


export const TransformReviewDetails = (review: any) => {                   
  const {upvotedBy, downvotedBy, poster, comments, route, locations, ...rest} = review;
  console.log(review)
  const commentTransformed = comments.map(({poster, ...rest}) => {
    return ({     
      posterName: poster.username,
      ...rest
    })
  });

const routeName = (route? route.name: "");
  const reviewTransformed = {
    upvoteCount: upvotedBy.length,
    downvoteCount: downvotedBy.length,
    posterName: poster.username,
    comments : commentTransformed,
    routeName: routeName,
    locations: TransformLocationToClient(locations),
    ...rest
  }

  return reviewTransformed;
}


export const TransformReviewOverview = (reviews: any) => {
  const response = reviews.map(({poster, downvotedBy, upvotedBy, route, images, content, registrationMark, driverIdentity, posterId, routeId, ...rest}) => {  
    const routeName = (route? route.name: "");
    return ({     
      posterName: poster.username,
      upvoteCount: upvotedBy.length,
      downvoteCount: downvotedBy.length,
      routeName: routeName,
      ...rest
    })
  })
  return response
}


export const TransformLocationToClient = (locations: any) => {
  const response = locations.map(({id, reviewId, timestamp, mocked, error, ...rest}) => {  
    console.log("type check",typeof(rest.latitude))
    return ({     
      coords: {
        ...rest
      },
      timestamp,
      mocked,
      error
    })
  })
  return response
}

export const TransformLocationToServer = (locations: any) => {
  if (!locations) return []
  const response = locations.map(({coords, ...rest}) => { 
    return ({
      ...coords,
      ...rest
    })
  })
  console.log(response)
  return response
}