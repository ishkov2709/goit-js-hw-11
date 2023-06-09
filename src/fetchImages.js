import axios from 'axios';
export { search };

const search = async (url, key, input, per_page, counter) => {
  const response = await axios.get(
    `${url}?key=${key}&q=${input}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${per_page}&page=${counter}`
  );
  return response.data;
};
