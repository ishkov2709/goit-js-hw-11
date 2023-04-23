import { search } from './fetchImages';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchImgForm: document.querySelector('.search-form'),
  inputForm: document.querySelector('input[name="searchQuery"]'),
  galleryBox: document.querySelector('.gallery'),
  btnLoad: document.querySelector('.load-more'),
};

let gallery = new SimpleLightbox('.gallery a');

let fetchCounter = 1;
let saveInput = '';

const API_KEY = '35683515-755808cb63fe444becf5469f8';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const onSubmitRenderGalleryHandler = async evt => {
  evt.preventDefault();
  const filledInput = refs.inputForm.value.toLowerCase().trim();
  if (!filledInput) return;
  checkCounter(filledInput);
  hideBtnLoad();
  try {
    const response = await search(API_KEY, saveInput, fetchCounter);
    const result = await checkOnInputResponse(response);
    return renderMarkup(refs.galleryBox, result);
  } catch (error) {
    onReject(error);
  }
};

const renderMarkup = (renderBox, response) => {
  const markup = response
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
        <div class="photo-card">
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
        </div>
      `
    )
    .join('');
  renderBox.insertAdjacentHTML('beforeend', markup);

  gallery.refresh();
};

gallery.on('show.simplelightbox', function () {
  gallery.refresh();
});

const checkOnInputResponse = response => {
  if (!response.totalHits) return;
  if (fetchCounter === 1) {
    Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
  }
  showBtnLoad();
  return response.hits;
};

const checkCounter = filledInput => {
  if (saveInput !== filledInput) {
    saveInput = filledInput;
    fetchCounter = 1;
    refs.galleryBox.innerHTML = '';
  } else {
    fetchCounter += 1;
  }
};

const showBtnLoad = () => {
  refs.btnLoad.classList.add('active');
  refs.btnLoad.addEventListener('click', onSubmitRenderGalleryHandler);
};

const hideBtnLoad = () => {
  refs.btnLoad.classList.remove('active');
  refs.btnLoad.removeEventListener('click', onSubmitRenderGalleryHandler);
};

const onReject = error => {
  if (error.response.status === 400) {
    return Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
  }

  return Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
};

refs.searchImgForm.addEventListener('submit', onSubmitRenderGalleryHandler);
