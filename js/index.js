const global = {
  currentPage: window.location.pathname,
  base_poster_url: 'https://image.tmdb.org/t/p/w500',
  currPageNumSearch: 1,
  totalPages: 0,
};

function init() {
  switch (global.currentPage.slice(global.currentPage.lastIndexOf('/'))) {
    case '/':
    case '/index.html':
      initSlider();
      getPopular('movie');
      getNowPlayingMovies();
      break;
    case '/search.html':
      getSearchResults();
      document.querySelector('.prev').addEventListener('click', loadPrev);
      document.querySelector('.next').addEventListener('click', loadNext);
      break;
    case '/tv-shows.html':
      getPopular('tv');
      break;
    case '/movie-details.html':
      getDetails('movie');
      break;
    case '/tv-show-details.html':
      getDetails('tv');
      break;
    default:
      break;
  }
}

document.addEventListener('DOMContentLoaded', init);

let slider;

async function initSlider() {
  const totalSlides = await getNowPlayingMovies();

  // Now initialize the slider with the correct number of slides
  slider = new SimpleSlider(document.querySelector('.slider-container'), {
    slidesPerView: 3,
    autoplay: true,
    autoplayInterval: 1500,
    loop: true,
    gap: '27px',
    totalSlides: totalSlides, // Pass the number of slides dynamically
    breakpoints: {
      0: 1, // For screen width >= 640px, show 1 slide
      500: 2, // For screen width >= 768px, show 2 slides
      914: 3, // For screen width >= 1024px, show 3 slides
    },
  });
}

async function getPopular(type) {
  const response = await getData(
    `https://api.themoviedb.org/3/${type}/popular?language=en-US&page=1'`
  );
  const grid = document.querySelector('.grid');
  grid.innerHTML = '';
  response.results.forEach((el) => {
    const a = document.createElement('a');
    a.href =
      type === 'movie'
        ? `movie-details.html?id=` + el.id
        : `tv-show-details.html?id=` + el.id;
    const div = document.createElement('div');
    div.className = 'box';
    const img = document.createElement('img');
    img.src = el.poster_path
      ? global.base_poster_url + el.poster_path
      : 'images/no-image.jpg';
    const div2 = document.createElement('div');
    div2.className = 'box-content';
    const h4 = document.createElement('h4');
    h4.innerText = type === 'movie' ? el.title : el.name;
    const p = document.createElement('p');
    p.innerText =
      type === 'movie'
        ? 'Released: ' + el.release_date
        : 'First Air Date: ' + el.first_air_date;
    div.appendChild(img);
    div2.appendChild(h4);
    div2.appendChild(p);
    div.appendChild(div2);
    a.appendChild(div);
    grid.appendChild(a);
  });
}

async function getNowPlayingMovies() {
  const response = await getData(
    'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1'
  );

  const sliderWrapper = document.querySelector('.slider-wrapper');
  sliderWrapper.innerHTML = ''; // Clear existing slides

  response.results.forEach((el) => {
    const div = document.createElement('div');
    div.className = 'slide';

    const a = document.createElement('a');
    a.href = 'movie-details.html?id=' + el.id;

    const img = document.createElement('img');
    img.src = global.base_poster_url + el.poster_path;

    const i = document.createElement('i');
    i.className = 'fa-solid fa-star gold';

    const p = document.createElement('p');
    p.innerText = (Math.ceil(el.vote_average * 10) / 10).toFixed(1);
    p.className = 'rating';

    a.appendChild(img);
    p.appendChild(i);
    a.appendChild(p);
    div.appendChild(a);

    sliderWrapper.appendChild(div);
  });

  // Return the number of slides fetched
  return response.results.length;
}

async function getSearchResults(page) {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const data = await getData(
    `https://api.themoviedb.org/3/search/${type}?query=${urlParams.get(
      'search-term'
    )}&include_adult=false&language=en-US&page=${page ? page : 1}`
  );
  console.log(data);
  if (global.currPageNumSearch === 1) {
    global.totalPages = data.total_pages;
  }

  const grid = document.querySelector('.grid');
  grid.innerHTML = '';
  data.results.forEach((el) => {
    const a = document.createElement('a');
    a.href = 'details.html?movie-id=' + el.id;
    const div = document.createElement('div');
    div.className = 'box';
    const img = document.createElement('img');
    img.src = el.poster_path
      ? global.base_poster_url + el.poster_path
      : 'images/no-image.jpg';
    const div2 = document.createElement('div');
    div2.className = 'box-content';
    const h4 = document.createElement('h4');
    h4.innerText = type === 'movie' ? el.title : el.name;
    const p = document.createElement('p');
    p.innerText =
      type === 'movie'
        ? 'Released: ' + el.release_date
        : 'First Air Date: ' + el.first_air_date;

    div.appendChild(img);
    div2.appendChild(h4);
    div2.appendChild(p);
    div.appendChild(div2);
    a.appendChild(div);
    grid.appendChild(a);
  });
  document.querySelector('.total-pages').innerText = global.totalPages;
  document.querySelector('.curr-page').innerText = global.currPageNumSearch;
}

function loadPrev() {
  if (--global.currPageNumSearch === 0) global.currPageNumSearch = 1;
  else getSearchResults(global.currPageNumSearch);
}

function loadNext() {
  if (++global.currPageNumSearch <= global.totalPages)
    getSearchResults(global.currPageNumSearch);
}

async function getDetails(type) {
  const urlParams = new URLSearchParams(window.location.search);
  const data = await getData(
    `https://api.themoviedb.org/3/${
      type === 'movie' ? 'movie' : 'tv'
    }/${urlParams.get('id')}?language=en-US`
  );
  document.querySelector('img').src = global.base_poster_url + data.poster_path;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  document.querySelector('.detaiz').innerHTML = `
          <h1>${type === 'movie' ? data.title : data.name}</h1>
        <p><i class="fa-solid fa-star"></i> ${(
          Math.ceil(data.vote_average * 10) / 10
        ).toFixed(1)} / 10</p>
        ${
          type === 'movie'
            ? `<p>Release Date: ${data.release_date}</p>`
            : `<p>First Air Date: ${data.first_air_date}</p> `
        }
        <p>
          ${data.overview}
        </p>
        <h4>Genres:</h4>
        <ul class="genres">
        ${data.genres.map((genre) => `<li>${genre.name}</li>`).join('')}
        </ul>
        <a href="${data.homepage}">Visit Movie Homepage</a>
  `;
  document.querySelector('.info').innerHTML =
    type === 'movie'
      ? `
  <h1>MOVIE INFO</h1>
      <p><span class="gold">Budget: </span> ${formatter.format(data.budget)}</p>
      <p><span class="gold">Revenue: </span>  ${formatter.format(
        data.revenue
      )}</p>
      <p><span class="gold">Runtime: </span> ${data.runtime} minutes</p>
      <p><span class="gold">Status: </span> ${data.status}</p>
      <p class="pc">Production Companies:</p>
      <p class="pc2">${data.production_companies
        .map((comp) => comp.name)
        .join(', ')}</p>
  `
      : `
  <h1>TV SHOW INFO</h1>
      <p><span class="gold">Number of Episodes: </span> ${
        data.number_of_episodes
      }</p>
      <p><span class="gold">Last Episode to Air: </span>  ${
        data.last_episode_to_air.name
      }</p>
      <p><span class="gold">Status: </span> ${data.status}</p>
      <p class="pc">Production Companies:</p>
      <p class="pc2">${data.production_companies
        .map((comp) => comp.name)
        .join(', ')}</p>
  `;

  showBackgroundImage(data.backdrop_path);

  console.log(data);
}

function showBackgroundImage(bgUrl) {
  const div = document.createElement('div');
  div.style.backgroundImage = `url(${global.base_poster_url + bgUrl})`;
  div.style.backgroundSize = 'cover';
  div.style.backgroundPosition = 'center';
  div.style.backgroundRepeat = 'no-repeat';
  div.style.height = '130%';
  div.style.width = '100vw';
  div.style.position = 'absolute';
  div.style.top = '80px';
  div.style.left = '0';
  div.style.zIndex = '-1';
  div.style.opacity = '0.1';

  document.querySelector('.details').appendChild(div);
} //=========Utils=========//

async function getData(url) {
  //
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTJlMWE5OWVkY2E2OWFjMmY0ODFjMTU1NWFiMzFiYyIsIm5iZiI6MTcyNjYwNTA3OC43NzIwODgsInN1YiI6IjY2ZTg3ZmYxZTgyMTFlY2QyMmIxMzcyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3I5QvYOCfvBnSHmhEMAestjgP-bhIt1qDqVpaoAgtJY',
    },
  };

  const spinner = document.querySelector('.spinner');

  spinner.classList.add('show');

  const response = await fetch(url, options);
  const data = await response.json();

  spinner.classList.remove('show');

  return data;
}

// const api_key = '?api_key=092e1a99edca69ac2f481c1555ab31bc';
// fetch('https://api.themoviedb.org/3/authentication', options)
// .then((response) => response.json())
// .then((response) => console.log(response))
// .catch((err) => console.error(err));

// fetch('https://api.themoviedb.org/3/configuration', options)
//   .then((response) => response.json())
//   .then((response) => console.log(response))
//   .catch((err) => console.error(err));

// fetch('https://image.tmdb.org/t/p/w500/wwemzKWzjKYJFfCeiB57q3r4Bcm.png')
//   .then((response) => response.blob())
//   .then(
//     (response) =>
//       (document.querySelector('img').src = URL.createObjectURL(response))
//   )
//   .catch((err) => console.error(err));
