const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const myapp = express();
myapp.use(express.json());

let data = null;
const databaseandServerIntialization = async () => {
  try {
    let dbpath = path.join(__dirname, "moviesData.db");
    data = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    myapp.listen(3000, () => {
      console.log(`Server started ${dbpath}`);
    });
  } catch (error) {
    console.log(`Database Error ${error.message}`);
    process.exit(1);
  }
};

databaseandServerIntialization();

const convertDatabaseObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//myapp get all movies
myapp.get("/movies/", async (request, response) => {
  const displayMoviesQuery = `
    SELECT movie_name FROM movie
    `;
  const displayMoviesArray = await data.all(displayMoviesQuery);
  response.send(
    displayMoviesArray.map((eachplayer) =>
      convertDatabaseObjectToResponseObject(eachplayer)
    )
  );
  console.log(displayMoviesArray);
});

//myapp post a movie
myapp.post("/movies/", async (request, response) => {
  const postMovie = request.body;

  const { directorId, movieName, leadActor } = postMovie;

  const postMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor) 
    VALUES(
    ${directorId},
   '${movieName}',
   '${leadActor}'    
    )`;
  const postMovieArray = await data.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

const convertDatabaseObjectToResponseObject2 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//myapp get a movie with movieId
myapp.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const displayMovieQueries = `
    SELECT * FROM movie 
    WHERE movie_id=${movieId}
    `;
  const displayMovieArray = await data.get(displayMovieQueries);
  console.log(displayMovieArray);
  response.send(
    displayMovieArray.map((eachMovie) => {
      convertDatabaseObjectToResponseObject2(eachMovie);
    })
  );
});

module.exports = myapp;
