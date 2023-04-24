import { search } from './fetchImages';
import axios from 'axios';
import Notiflix, { Loading } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';
import OnlyScroll from 'only-scrollbar';

// Variables

const refs = {
  searchImgForm: document.querySelector('.search-form'),
  inputForm: document.querySelector('input[name="searchQuery"]'),
  galleryBox: document.querySelector('.gallery'),
  btnLoad: document.querySelector('.load-more'),
};

let fetchCounter = 1;
let saveInput = '';

const API_KEY = '35683515-755808cb63fe444becf5469f8';

// Custom Libraries

axios.defaults.baseURL = 'https://pixabay.com/api/';

let gallery = new SimpleLightbox('.gallery a');

const scroll = new OnlyScroll(document.scrollingElement);

let infScroll = new InfiniteScroll(refs.galleryBox, {
  path: function () {
    fetchCounter += 1;
    return `${axios.defaults.baseURL}?key=${API_KEY}&q=${saveInput}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${fetchCounter}`;
  },
  responseBody: 'json',
  status: '.scroll-status',
  history: false,
});

// Funtions

// Events Foo

const onSubmitRenderGalleryHandler = async evt => {
  evt.preventDefault();
  const input = evt.currentTarget.elements.searchQuery.value
    .toLowerCase()
    .trim();
  if (!input || saveInput === input) return;
  checkResultInput(input);
  try {
    const response = await search(API_KEY, saveInput, infScroll.pageIndex);
    const result = await checkOnInputResponse(response);
    return renderMarkup(result);
  } catch {
    onRejectBtnSearch();
  }
};

// Render Foo

const renderMarkup = response => {
  const markup = response.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <article class="photo-card post">
            <a href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item">
                    <b>Likes</b>
                    ${likes}
                </p>
                <p class="info-item">
                    <b>Views</b>
                    ${views}
                </p>
                <p class="info-item">
                    <b>Comments</b>
                    ${comments}
                </p>
                <p class="info-item">
                    <b>Downloads</b>
                    ${downloads}
                </p>
            </div>
        </article>
      `
    )
    .join('');

  refs.galleryBox.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
};

// Check Foo

const checkResultInput = evt => {
  if (saveInput !== evt) {
    saveInput = evt;
    fetchCounter = 1;
    refs.galleryBox.innerHTML = '';
  }
};

const checkOnInputResponse = response => {
  if (!response.totalHits) return;
  if (fetchCounter === 1) {
    Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
  }
  return response;
};

// Utils Foo

const onRejectBtnSearch = () => {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
};

const onRejectScroll = () => {
  return Notiflix.Notify.info(
    `We're sorry, but you've reached the end of search results.`
  );
};

// Fixed Foo

const fixJumpContainer = evt => {
  const lightbox = document.querySelector('.simple-lightbox');
  if (lightbox === evt.target) {
    return scroll.unlock();
  }
  if (lightbox) {
    return scroll.lock();
  }
};

// Listeners

refs.searchImgForm.addEventListener('submit', onSubmitRenderGalleryHandler);
window.addEventListener('click', fixJumpContainer);

infScroll.on('load', renderMarkup);
infScroll.on('error', onRejectScroll);
