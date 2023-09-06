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

myapp.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieDetails = request.body;
  const { directorId, movieName, leadActor } = updateMovieDetails;
  const updateMovieDetailsQuery = `
    UPDATE movie
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id=${movieId};

    `;
  await data.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

myapp.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId} 
    `;
  await data.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDbdirectorToresponseDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

myapp.get("/directors/", async (request, response) => {
  const displayDirectorQuery = `
    SELECT * FROM director
    `;
  const displayDirectorsArray = await data.all(displayDirectorQuery);
  response.send(
    displayDirectorsArray.map((eachDirector) =>
      convertDbdirectorToresponseDirector(eachDirector)
    )
  );

  console.log(displayDirectorsArray);
});

myapp.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const displayDirectorQuery = `
    SELECT movie_name FROM movie NATURAL JOIN director;
    WHERE director_id=${directorId};
    `;
  const displayDirector = await data.get(displayDirectorQuery);
  response.send(displayDirector);
  console.log(displayDirector);
});

module.exports = myapp;
