update movies set title='abc' where movie_id = 123;
update watch_list IF_NULL('movie_ids',JSON_CONCAT('movie_ids',12),[24]) where list_id = 123;

sel \* from movies where id in (select movie_ids from wl where lid = 123)

const fetchAllRecord = async () => {
// 1. fetch movie list from api with details
// 2. store formated response in db
// 3. loop till we get no movies

    while(true) {
        const movies = await getMoviesList();

        if(movies.length = 0) break;

        const movieDetails = Promise.all(movies.map(movie => ({
            movie: movie,
            detail: await getMovieDetail(movie)
        })))

        const formatedMovies = await movieDetails.map(movie => formatMovie(movie));

        await storeMovies(formatedMovies)

        logProgress()
    }

}
