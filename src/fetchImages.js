import axios from 'axios';
export { search };

const search = async (key, input, counter) => {
  const response = await axios.get(
    `?key=${key}&q=${input}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${counter}`
  );
  return response.data;
};
