import { createInterface } from "readline"; import * as fs from "fs";

let inputs = "";
let inputArray: string[];
let currentIndex = 0;

let outputBuffer = "";

function next() {
  return inputArray[currentIndex++];
}
function nextNum() {
  return +next();
}
function nextBigInt() {
  return BigInt(next());
}
function nexts(length: number) {
  const arr = [];
  for (let i = 0; i < length; ++i) arr[i] = next();
  return arr;
}
function nextNums(length: number) {
  const arr = [];
  for (let i = 0; i < length; ++i) arr[i] = nextNum();
  return arr;
}
function nextBigInts(length: number) {
  const arr = [];
  for (let i = 0; i < length; ++i) arr[i] = nextBigInt();
  return arr;
}

function print(out: string | number | bigint): void;
function print<T>(out: Array<T>, separator: string): void;
function print<T>(out: string | number | bigint | Array<T>, separator?: string) {
  if (Array.isArray(out)) {
    outputBuffer += out.join(separator);
  } else {
    outputBuffer += out;
  }
}

function println(out: string | number | bigint): void;
function println<T>(out: Array<T>, separator: string): void;
function println<T>(out: string | number | bigint | Array<T>, separator?: string) {
  if (Array.isArray(out)) {
    print(out, separator || "");
  } else {
    print(out);
  }
  print("\n");
}

function flush() {
  console.log(outputBuffer);
}

// デバッグ環境がWindowsであれば条件分岐する

function* combinations<T>(iterable: Iterable<T>, r: number) {
  const pool = [...iterable]
  const n = pool.length
  if (n < r) return

  const indices = [...new Array(r)].map((_, i) => i)
  yield indices.map((i) => pool[i])
  while (true) {
    let i
    for (i = r - 1; i >= 0; i--) {
      if (indices[i] !== n - (r - i)) {
        break
      }
    }
    if (i === -1) return
    indices[i]++
    for (let j = i + 1; j < r; j++) {
      indices[j] = indices[j - 1] + 1
    }
    yield indices.map((i) => pool[i])
  }
}
type PCG<T> = (filter: Filter<T>) => (selecteds: Iterable<T>) => (k: number) => (options: Array<T>) => Generator<any>
const innerPCG: PCG<number | string> = filterFunc => selecteds => k => options => function* () {
  if (k === 0) {
    yield selecteds
    return
  }
  for (const i of options.keys()) {
    yield* innerPCG(filterFunc)(
      [...selecteds, options[i]])(k - 1)(filterFunc(i)(options))
  }
}()

type Filter<T> = (num: number) => (options: Array<T>) => Array<T>
// 順列
const permFilter: Filter<number | string> = i => options =>
  [...options.slice(0, i), ...options.slice(i + 1)]
const permG = innerPCG(permFilter)([])

// 組み合わせ
const combiFilter: Filter<number | string> = i => options =>
  options.slice(i + 1)
const combiG = innerPCG(combiFilter)([])

// 重複順列
const repPermFilter: Filter<number | string> = i => options =>
  options
const repPermG =
  innerPCG(repPermFilter)([])

// 重複組み合わせ
const repCombiFilter: Filter<number | string> = i => options =>
  options.slice(i)
const repCombiG =
  innerPCG(repCombiFilter)([])

// 使用例：
// [...permG(2)([0,1,2])];  
// [...combiG(2)([0,1,2])];
// [...repPermG(3)([0,1])];
// [...repCombiG(3)([0,1])];


function main() {
  let str = next()
  const seeds = ['dream', 'dreamer', 'erase', 'eraser']
  let match = false
    const find = (cur: string) => {
    if (match) return
    const matchedStrs = seeds.filter(seed => cur.startsWith(seed))
    if (!matchedStrs.length) {
      return
    }
    matchedStrs.forEach(matchedStr => {
      if (match) return
      const nextStr = cur.slice(matchedStr.length)
      if (nextStr.length === 0) {
        match = true
      }
      find(nextStr)
    })
  }
  find(str)
  if (match) {
    console.log("YES")
  } else {
    console.log('NO')
  }
}

if (process.env.OS == "Windows_NT") {
  const stream = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  stream.on("line", (line) => {
    inputs += line;
    inputs += "\n";
  });
  stream.on("close", () => {
    inputArray = inputs.split(/\s/);
    main();
    flush();
  });
} else {
  inputs = fs.readFileSync("/dev/stdin", "utf8");
  inputArray = inputs.split(/\s/);
  main();
  flush();
}