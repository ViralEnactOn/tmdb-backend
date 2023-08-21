const config = require("../config/config");
const db = require("../config/db");
const { movieSchema } = require("../models/movieModel");

db.schema.hasTable("movie").then(async (exists) => {
  if (!exists) {
    await movieSchema.then((response) => {
      fetchAllRecord();
    });
  } else {
    fetchAllRecord();
  }
  console.log(exists);
});

const fetchAllRecord = async () => {
  const fetchData = async (page) => {
    const endPoint = `${config.tmdb_service.api_url}discover/movie?page=${page}`;
    const response = await fetch(endPoint, config.tmdb_service.options);
    const data = await response.json();
    return data.results;
  };
  fetchData(1);

  const fetchDetailRecord = async (movieId) => {
    const endPoint = `${config.tmdb_service.api_url}movie/${movieId}`;
    const response = await fetch(endPoint, config.tmdb_service.options);
    const data = await response.json();
    return data;
  };

  const fetchExternalIdRecord = async (movieId) => {
    const endPoint = `${config.tmdb_service.api_url}movie/${movieId}/external_ids`;
    const response = await fetch(endPoint, config.tmdb_service.options);
    const data = await response.json();
    return data;
  };
  const insertData = async () => {
    try {
      let page = 1;
      let combinedRecords = [];

      let insertedCount = 0;
      while (true) {
        const data = await fetchData(page);
        const combinedData = await Promise.all(
          data.map(async (item) => {
            const detailRecord = await fetchDetailRecord(item.id);
            const fetchExternalId = await fetchExternalIdRecord(item.id);
            return {
              ...item,
              detail: detailRecord,
              external_ids: fetchExternalId,
            };
          })
        );
        if (page === 101) {
          break;
        }
        combinedRecords.push(...combinedData);
        console.log("Total Records", combinedRecords.length);
        page++;
      }

      const insertPromises = combinedRecords.map(async (item, index) => {
        let production_countries = [];
        let spoken_languages = [];
        let newDetail = await item.detail.production_countries.map((data) => {
          production_countries.push(data.iso_3166_1);
        });
        let spokenDetail = await item.detail.spoken_languages.map((data) => {
          spoken_languages.push(data.iso_639_1);
        });
        await db("movie").insert({
          id: item.id,
          adult: item.adult,
          backdrop_path: config.tmdb_service.image_url + item.backdrop_path,
          genre_ids: JSON.stringify(item.genre_ids),
          original_language: item.original_language,
          original_title: item.original_title,
          overview: item.overview,
          popularity: item.popularity,
          poster_path: config.tmdb_service.image_url + item.poster_path,
          poster_path_mobile:
            config.tmdb_service.mobile_image_url + item.poster_path,
          title: item.title,
          video: item.video,
          vote_average: item.vote_average,
          vote_count: item.vote_count,
          budget: item.detail.budget,
          imdb_id: item.detail.imdb_id,
          release_date: item.detail.release_date,
          revenue: item.detail.revenue,
          runtime: item.detail.runtime,
          status: item.detail.status,
          production_countries: JSON.stringify(production_countries),
          spoken_languages: JSON.stringify(spoken_languages),
          external_ids: item.external_ids,
        });
        insertedCount++;
        const totalRecords = combinedRecords.length;
        if (insertedCount % 100 === 0 || insertedCount === totalRecords) {
          const recordsLeft = totalRecords - insertedCount;
          console.log(
            `Inserted ${insertedCount} records. ${recordsLeft} records left.`
          );
        }
      });
      await Promise.all(insertPromises);
      const insertedData = await db.from("movie");
      console.log("Record Inserted Successfully");
    } catch (error) {
      console.log("Catch error", error);
    }
  };
  insertData();
};

fetchAllRecord();
