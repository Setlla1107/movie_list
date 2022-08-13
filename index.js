const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = [] //完整80部電影 
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
let filteredMovies = [] //使用者搜尋出來的電影清單


const dataPanel = document.querySelector('#data-panel')

function renderMovieList(data) {
  let rawHTML = ''


  data.forEach((item) => {

    rawHTML += `
    <div class="col-sm-3">       
        <div class="mb-2">        
          <div class="card">
            <img
              src="${POSTER_URL + item.image}" 
              class="card-img-top" alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>       
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" 
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {

    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // console.log(event)
  event.preventDefault()
  // console.log(searchInput.value)
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  if (!keyword.length) {
    return alert('請輸入有效字串!')
  }

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字:${keyword}沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {
  // 要分頁80部電影清單? 還是使用者搜尋出來的電影清單?  取決於使用者有沒有在搜尋

  const data = filteredMovies.length ? filteredMovies : movies
  // 搜尋電影清單的陣列長度? 有長度的話代表有搜尋所以有內容，就使用filteredMovies；沒有的話就用movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)

}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  // console.log(event.target.dataset.page)  網頁點擊頁數 console欄會秀出對應頁數
  const page = Number(event.target.dataset.page)

  renderMovieList(getMoviesByPage(page))
})

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})
  .catch((err) => console.log(err))