const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const modeSwitch = document.querySelector('#model-switch-section') //*********新增顯示模式識別值**********
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
let page = 1  //*********修改，抽取成可以共用的變數。**********
const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(page), dataPanel.dataset.viewmodel)
  })
  .catch((err) => console.log(err))



//** function** 製作卡片式內容 OR 清單式內容
const renderMovieList = (data, model) => {
  if (model === 'list') {
    dataPanel.innerHTML = `<ul class="container-fluid list-group list-group-flush">
                             ${renderListModelList(data)}
                           </ul>`
  } else {
    dataPanel.innerHTML = renderCardModelList(data)
  }
}

//新增
// **function** dataPanel製作卡片模式內容
function renderCardModelList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
        <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
        </div>
        </div>
        </div>`
  })

  return rawHTML
}

//新增
// **function** dataPanel製作list模式內容 
function renderListModelList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
                    <li class=" list-group-item d-flex justify-content-between">
                      <div>
                        ${item.title}
                      </div>
                      <div>
                      <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                      <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                      </div>
                    </li>
                  `
  })

  return rawHTML
}

// **function** 製作頁數
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

// **function** 加入被點擊的電影資訊Modal
const showMovieModal = (id) => {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = `Release date: ${data.release_date}`
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
}

// **function** 加入收藏夾
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// **function** 依當前頁數切割電影清單並回傳
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// **EventListener** 監聽被點擊的電影動作(more OR +)
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// **EventListener** 監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
  //條件篩選
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  //重新輸出至畫面
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1, dataPanel.dataset.viewmodel))
})

// **EventListener** 監聽被點擊的頁數
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page), dataPanel.dataset.viewmodel)
})

// **EventListener** 監聽被點擊的顯示模式(card oe list)
modeSwitch.addEventListener('click', function viewModelSwitch(event) {
  if (event.target.classList.contains('card-model')) {
    dataPanel.dataset.viewmodel = 'card'
  } else if (event.target.classList.contains('list-model')) {
    dataPanel.dataset.viewmodel = 'list'
  }

  renderMovieList(getMoviesByPage(page), dataPanel.dataset.viewmodel)
})