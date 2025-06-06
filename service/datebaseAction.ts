import { prisma } from "./prismaClient"
import { TransportType } from "@prisma/client"
import type { Location } from '@prisma/client'

interface LocationInput{
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp?: number;
  mocked?: boolean;
  error?: string;
}


export const CreateUser = async (name : string, password : string) => {
  const user = await prisma.user.create({
    data:{
      username: name,
      password: password
    }
  })
  return user
}

export const GetUserByName = async (name : string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: name,
    }
  })
  return user
}

export const GetUserById = async (user_id : string) => {
  const user = await prisma.user.findUnique({
    where: {
      uuid: user_id
    },
  })
  console.log("user find:", user)
  return user
}

export const GetUserProfileById = async (user_id : string) => {
  const user = await prisma.user.findUnique({
    where: {
      uuid: user_id
    },
    include: {
      reviews: {
        select: {
          id : true
        } 
      },
      upvotedReviews: {
        select: {
          id : true
        } 
      },
      downvotedReviews: {
        select: {
          id : true
        } 
      },
      comments: {
        select: {
          id : true
        } 
      },
    }
  })
  if (!user) return false;

  const reviews = user.reviews.map(({id}) => id)
  const upvotedReviews = user.upvotedReviews.map(({id}) => id)
  const downvotedReviews = user.downvotedReviews.map(({id}) => id)
  const comments = user.comments.map(({id}) => id)
  
  const userProfile = {
    uuid: user.uuid,
    username: user.username,
    reviews: reviews,
    upvotedReviews: upvotedReviews,
    downvotedReviews: downvotedReviews,
    comments: comments,
  }

  return userProfile;
}

export const GetUsers = async () => {
  const user = await prisma.user.findMany()
  console.log("users find:", user)
  return user
}


export const ChangePassword = async (id: string, password: string) => {
  const user = await prisma.user.update({
    where: { uuid: id},
    data: {
      password : password
    }
  })
  console.log("users find:", user)
  return user
}

export const GetAllReview = async () => {
  const review = await prisma.review.findMany({
    include: {
      upvotedBy: {
        select: {
          username : true
        } 
      },
      downvotedBy: {
        select: {
          username : true
        } 
      },
      poster: {
        select: {
          username : true
        } 
      },
      route: {
        select: {
          name : true
        }
      }
    }
  })
  return review 
}

export const GetReviewById = async (id : number) => {
  const review = await prisma.review.findFirst({
    where: {
      id: id
    },
    include: {
      upvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      downvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      comments: {
        include:{
          poster : {
            select: {
              username : true
            } 
          }
        }
      },
      poster: {
        select: {
          username : true
        } 
      },
      route: {
        select: {
          name : true
        }
      },
      locations: true
    }

  })
  return review
}


export const GetRouteOLD = async (type: TransportType, route: string) => {
  const result = await prisma.route.findUnique({
    where: {
      type_route: type+"-"+route.toLowerCase()
    },
    include: {
      reviews: {
        select: {
          poster : true
        } 
      },
    }
  })
  return result
}

export const GetRoute = async (id: number) => {
  const result = await prisma.route.findUnique({
    where: {
      id: id
    },
    include: {
      reviews: {
        include: {
          upvotedBy: {
            select: {
              username : true
            } 
          },
          downvotedBy: {
            select: {
              username : true
            } 
          },
          poster: {
            select: {
              username : true
            } 
          }
        }
      }
    }
  })
  return result
}

export const GetRouteDetailed = async (id: number) => {
  const result = await prisma.route.findUnique({
    where: {
      id: id
    },
    include: {
      reviews: {
        include: {
          upvotedBy: {
            select: {
              username : true
            } 
          },
          downvotedBy: {
            select: {
              username : true
            } 
          },
          
        }
      }
    }
  })
  return result
}

export const SearchRoutes = async (searchValue: string) => {
  const routes = await prisma.route.findMany({
    where: {
      name: {
        contains: searchValue.toLowerCase()
      }
    }
  })
  return routes
}


export const CreateReview = async (title : string, content : string, rating : number, poster_id : string, type : TransportType, route: string, images: string[], locations? : LocationInput[], registrationMark? : string, driverIdentity? : string) => {
  const review = await prisma.review.create({
    data: {
      title: title,
      content: content,
      rating: rating,
      type: type,
      registrationMark: registrationMark,
      driverIdentity: driverIdentity,
      images: images,
    }
  })

  const user = await prisma.user.update({
    where: { uuid: poster_id},
    data: {
      reviews: {
        connect: {
          id: review.id
        }
      }
    }
  })

  //Create Locations
  if (locations.length>0) {
    const locationsList = await prisma.location.createManyAndReturn({
      data: locations
    })

    await prisma.review.update({
      where: { id: review.id},
      data: {
        locations: {
          connect:  
            locationsList.map(l => ({ id: l.id })) || [],
        }
      }
    })
  }
  




  if (route && type) {
    console.log("have route",route)
    const updated_route = await prisma.route.upsert({
      where: { 
        type_route: type+"-"+route
      },
      update:{
        reviews: {
          connect: {
            id: review.id
          }
        }
      },
      create: {
        type_route: type+"-"+route.toLowerCase(),
        type: type,
        name: route.toLowerCase(),
        reviews: {
          connect: {
            id: review.id
          }
        }
      }
    });

    return updated_route;
  }
  return null;
}

export const UpvoteReview = async (user_id : string, review_id : number) => {
  const updated_user = await prisma.user.update({
    where: { uuid: user_id},
    data: {
      upvotedReviews: {
        connect: {
          id: review_id
        }
      }
    },
    include: {
      upvotedReviews: {
        select: {
          id: true
        }
      },downvotedReviews: {
        select: {
          id: true
        }
      }
    }
  })

  const updated_review = await prisma.review.update({
    where: { id: review_id},
    data: {
      upvotedBy: {
        connect: {
          uuid: user_id
        }
      }
    },include: {
      upvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      downvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      comments: {
        include:{
          poster : {
            select: {
              username : true
            } 
          }
        }
      },
      poster: {
        select: {
          username : true
        } 
      },
      route: {
        select: {
          name : true
        }
      },
      locations: true
    }
  })
  console.log("Updated Review after upvoting", updated_review);
  const updated_upvotedReviews = updated_user.upvotedReviews.map(({id}) => id);
  const updated_downvotedReviews = updated_user.downvotedReviews.map(({id}) => id);

  return {updated_review, updated_upvotedReviews, updated_downvotedReviews};
}

export const RemoveUpvoteReview = async (user_id : string, review_id : number) => {
  const updated_user = await prisma.user.update({
    where: { uuid: user_id},
    data: {
      upvotedReviews: {
        disconnect: {
          id: review_id
        }
      }
    },
    include: {
      upvotedReviews: {
        select: {
          id: true
        }
      },downvotedReviews: {
        select: {
          id: true
        }
      }
    }
  })

  const updated_review = await prisma.review.update({
    where: { id: review_id},
    data: {
      upvotedBy: {
        disconnect: {
          uuid: user_id
        }
      }
    },include: {
      upvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      downvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      comments: {
        include:{
          poster : {
            select: {
              username : true
            } 
          }
        }
      },
      poster: {
        select: {
          username : true
        } 
      },
      route: {
        select: {
          name : true
        }
      },
      locations: true
    }
  })
  console.log("Updated Review after removing upvote", updated_review);
  const updated_upvotedReviews = updated_user.upvotedReviews.map(({id}) => id);
  const updated_downvotedReviews = updated_user.downvotedReviews.map(({id}) => id);

  return {updated_review, updated_upvotedReviews, updated_downvotedReviews};
}

export const DownvoteReview = async (user_id : string, review_id : number) => {
  const updated_user = await prisma.user.update({
    where: { uuid: user_id},
    data: {
      downvotedReviews: {
        connect: {
          id: review_id
        }
      }
    },
    include: {
      upvotedReviews: {
        select: {
          id: true
        }
      },downvotedReviews: {
        select: {
          id: true
        }
      }
    }
  })
  console.log("This one downvoted: ", updated_user);

  const updated_review = await prisma.review.update({
    where: { id: review_id},
    data: {
      downvotedBy: {
        connect: {
          uuid: user_id
        }
      }
    },include: {
      upvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      downvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      comments: {
        include:{
          poster : {
            select: {
              username : true
            } 
          }
        }
      },
      poster: {
        select: {
          username : true
        } 
      },
      route: {
        select: {
          name : true
        }
      },
      locations: true
    }
  })
  console.log("Updated Review after downvoting", updated_review);
  const updated_upvotedReviews = updated_user.upvotedReviews.map(({id}) => id);
  const updated_downvotedReviews = updated_user.downvotedReviews.map(({id}) => id);

  return {updated_review, updated_upvotedReviews, updated_downvotedReviews};
}

export const RemoveDownvoteReview = async (user_id : string, review_id : number) => {
  const updated_user = await prisma.user.update({
    where: { uuid: user_id},
    data: {
      downvotedReviews: {
        disconnect: {
          id: review_id
        }
      }
    },
    include: {
      upvotedReviews: {
        select: {
          id: true
        }
      },downvotedReviews: {
        select: {
          id: true
        }
      }
    }
  })
  console.log("This one removed his downvote: ", updated_user);

  const updated_review = await prisma.review.update({
    where: { id: review_id},
    data: {
      downvotedBy: {
        disconnect: {
          uuid: user_id
        }
      }
    }, include: {
      upvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      downvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      comments: {
        include:{
          poster : {
            select: {
              username : true
            } 
          }
        }
      },
      poster: {
        select: {
          username : true
        } 
      },
      route: {
        select: {
          name : true
        }
      },
      locations: true
    }
  })
  console.log("Updated Review after removing downvote", updated_review);
  const updated_upvotedReviews = updated_user.upvotedReviews.map(({id}) => id);
  const updated_downvotedReviews = updated_user.downvotedReviews.map(({id}) => id);

  return {updated_review, updated_upvotedReviews, updated_downvotedReviews};
}


export const CreateComment = async (content: string,review_id : number, poster_id : string) => {
  const comment = await prisma.comment.create({
    data:{
      content: content
    }
  })

  const user = await prisma.user.update({
    where: { uuid: poster_id},
    data: {
      comments: {
        connect: {
          id: comment.id
        }
      }
    }
  })

  const review = await prisma.review.update({
    where: { id: review_id},
    data: {
      comments: {
        connect: {
          id: comment.id
        }
      }
    }, include: {
      upvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      downvotedBy: {
        select: {
          username : true,
          uuid : true,
        } 
      },
      comments: {
        include:{
          poster : {
            select: {
              username : true
            } 
          }
        }
      },
      poster: {
        select: {
          username : true
        } 
      },
      route: {
        select: {
          name : true
        }
      },
      locations: true
    }
  })

  return review;
}


export const UpdateRoute = async (id: number, summary: string) => {
  const updated_route = await prisma.route.update({
      where: { 
        id: id
      },
      data:{
        summary: summary
      }
    });
}