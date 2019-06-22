import example from 'barrage-ui/example.json';

const randomKey = () =>
  new Array(2)
    .fill(0)
    .map(() =>
      Math.random()
        .toString(32)
        .slice(2)
    )
    .join('');

const colors = ['#0f0', '#ff0', '#fff'];
const randomColor = () => colors[Math.floor(6 * Math.random())];

const randomText = () =>
  example[Math.floor(example.length * Math.random())].text;

const createdStart = Date.now();

const database = new Array(1000).fill(null).map((d, i) => ({
  key: randomKey(),
  time: 1000 * (i + Math.random()),
  text: randomText(),
  color: randomColor(),
  createdAt: createdStart + Math.random() * 24 * 3600 * 1000,
}));

export default database;