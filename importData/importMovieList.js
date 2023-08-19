const {
  API_URL,
  options,
  IMAGE_URL,
  MOBILE_IMAGE_URL,
} = require("../config/config");
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
    const endPoint = `${API_URL}discover/movie?page=${page}`;
    const response = await fetch(endPoint, options);
    const data = await response.json();
    return data.results;
  };

  const fetchDetailRecord = async (movieId) => {
    const endPoint = `${API_URL}movie/${movieId}`;
    const response = await fetch(endPoint, options);
    const data = await response.json();
    return data;
  };

  const fetchExternalIdRecord = async (movieId) => {
    const endPoint = `${API_URL}movie/${movieId}/external_ids`;
    const response = await fetch(endPoint, options);
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
        await db("movie").insert({
          id: item.id,
          adult: item.adult,
          backdrop_path: IMAGE_URL + item.backdrop_path,
          genre_ids: JSON.stringify(item.genre_ids),
          original_language: item.original_language,
          original_title: item.original_title,
          overview: item.overview,
          popularity: item.popularity,
          poster_path: IMAGE_URL + item.poster_path,
          poster_path_mobile: MOBILE_IMAGE_URL + item.poster_path,
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
