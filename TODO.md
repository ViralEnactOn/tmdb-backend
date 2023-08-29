# Create backend api for movies api.

## Summary

The app will allow users to explore movies available in our system and filter based on gener, country, language, and other parameters.
Users are also allowed to bookmark movie and add them to multiple watch list and share them publically to their friends.
Once they have verified their email they are also allowed to rate the movies based on multiple criteria and add comments.
Apart from this we will also provide various statistics and numerical insights to the enduser

## Task 1: Data import

The data for our application will be comming from TMDB Api.
Ref: https://www.themoviedb.org/
Save the data into our local database first.
Use discover endpoint: https://api.themoviedb.org/3/discover/movie?api_key=API_KEY
Along with the fields in discover endpoints we also need to have the following data stored in our system: https://i.imgur.com/BzKseYh.png
Api: https://api.themoviedb.org/3/movie/MOVIE_ID?api_key=API_KEY&append_to_response=external_ids

## Task 1.1: Api for movies data

Once the data is in our system, expose this data via api to the end user. Any user (even guest) should be able to atleast explore data

## Task 2: Authentication

Add authentication layer for the user to
a. register and send send wellcome EMAIL after successfull registeration
b. login (only after login user is able to favourite movie, create lists, rate movie, comment on movie)
c. forget password (it should send email to user for token to reset password)
d. reset password (it will accept the token, and user id and allow the user to reset its password)
f. verify email (after email verification only comments and rating are allowed)

## Task 3: Favourites and Lists (Only authenticated user are allowed to fav and manage list)

Also the users will be able to favourite the movies and manage their favourited movies by adding or removing them.

The users should also be able to create many different watch lists like Winter List, Lazy Sunday list and they should be able to
a. Add/Remove Movies from the list
b. Publically share the list
c. Show genere wise vote_average in the list

## Task 4: Like/Dislike, Ratings and Comments (Only users who have verified their emails should be able to do this)

Users are allowed to reactions such as like/dislike movies something like thumbs up and thumbs down.

Also the users will be allowed to rate the movies based on the following parameters:
Plot, Acting and Direction, Visuals and Effects, Writing and Dialog, Sound and Music, Pacing and Structure

Users are allowed to comment on movies and other peoples comments as well. Also use richtext editor to allow them to bold, italics and underline their message.

Also on homepage or movies list, show how many likes/dislikes each movie has gotten

## Task 5: Movie Insights

1. Chart on how many movies are released in last 3 years per week (should be able to filter data based on genere)
2. Movie profit/loss summary based
3. Country wise movie revenue

---

## Rev 1

controller

- validate request
- perform action (db, third party service, call another command)
- perform sideeffects ()
- prepare response
- send response
