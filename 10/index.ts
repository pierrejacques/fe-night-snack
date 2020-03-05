import { IO } from './io';

export function showReview() {
  try {
    const dataStr = localStorage.getItem('前端夜点心的数据');
    const data = JSON.parse(dataStr);
    const reviewData = data.review;
    const reviewOutput = reviewData.map(
      (count, index) => `第${index}篇文章的阅读量是${count}`
    ).join(',');
    console.log(reviewOutput);
  } catch(e) {
    console.log('读取错误');
  }
}

const readFromStorage = () => localStorage.getItem('前端夜点心的阅读量');
const writeToConsole = content => console.log(content);

// 解析 JSON
const parseJSON = string => JSON.parse(string);

// 读取 review 字段
const getReviewProp = data => data.review;

// 把 review 字段拼装成字符串
const mapReview = reviewData => reviewData.map(
  (count, index) => `第${index}篇文章的阅读量是${count}`
).join(',');

const storageIO = new IO(readFromStorage);

// 组合上面的这些函数，得到新的 Monad
export const task = storageIO
  .map(parseJSON)
  .map(getReviewProp)
  .map(mapReview)

task.fork(writeToConsole)

const readByKey = key => new IO(() => localStorage.getItem(key));

export const task2 = readByKey('firstKey') // 通过第一个 key 读取存储
  .map(parseJSON)
  .map(v => v.key) // 获取第二个 key
  .chain(readByKey) // 通过第二个 key 读取存储
  .map(parseJSON)
