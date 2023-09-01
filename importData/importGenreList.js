const config = require("../config/config");
const db = require("../config/db");

const fetchData = async () => {
  const endPoint = `${config.tmdb_service.api_url}genre/movie/list?language=en`;
  const response = await fetch(endPoint, config.tmdb_service.options);
  const data = await response.json();
  console.log({ data });
  return data.genres;
};

const insertData = async () => {
  try {
    const data = await fetchData();

    let formatedMovies = [];
    const insertPromises = data.map(async (item, index) => {
      formatedMovies.push({
        id: item.id,
        name: item.name,
      });
    });
    await Promise.all(insertPromises);
    await db("movie_genre_list").insert(formatedMovies);

    console.log("Record Inserted Successfully");
  } catch (error) {
    console.log("Catch error", error);
  }
};
insertData();
