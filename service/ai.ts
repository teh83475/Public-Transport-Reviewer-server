

import { GetRoute, UpdateRoute } from "./datebaseAction";

export const aiQuery = async (message: string) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "anthropic/claude-3.7-sonnet",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": message
              }
            ]
          }
        ]
      })
    });
    const body = await response.json();
    console.log(JSON.stringify(body.choices));
    return body.choices[0].message.content;
  } catch (error) {
    console.error(error);
  }
  
}



export const checkToken = async () => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
    const body = await response.json();
    console.log(body.data);
    return body.data;
  } catch (error) {
    console.error(error);
  }
  
}


export const updateSummary = async (id: number) => {
  try {
    const route = await GetRoute(id);

    let query = `You are part of a public transport review application. Summarize the reviews for a particular public transport route for passenger who want to learn more about the route using the following information:
The range of rating is 1 to 5 with 5 being the best.
Ignore test reviews and do not mention them in the summary. Also don't mention the existence of these test reviews at all.
Please just summarize the rating in one sentence without mentioning the actual number. Just tell whether it is a good rating or not. 
The content of this summary should focus on reviews contents
Please summarize in one paragraph using 5 or less sentences.\n
route name: ${route.name}\n
`;


    route.reviews.forEach((review, index) => {
      query += `Review ${index+1}:
rating given to this route: ${review.rating}
review title:  ${review.title}
review content:  ${review.content}
\n\n`
    });
    query+=""
    
    console.log(query)
    

    const response = await aiQuery(query)

    console.log(response);

    await UpdateRoute(id, response);


    return response;
  } catch (error) {
    console.error(error);
  }
  
}
