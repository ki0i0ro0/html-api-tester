// ファイル選択
const selectedFileElement = document.getElementById("selected-file")

// ファイル選択をイベントリスナーに設定
selectedFileElement.addEventListener(
  "change",
  (event) => {
    const file = event.target.files
    const reader = new FileReader()
    reader.readAsText(file[0])
    reader.onload = (ev) => {
      setValueFromFile(reader.result)
      setValuesFromLocalStorage()
    }
  },
  false
)

const setTable = async () => {
  const result = await requestAPI("https://swapi.dev/api/people", "GET")
  createTable(result.results)
}

const createTable = (data) => {
  // table要素を生成
  const table = document.createElement("table")
  table.setAttribute("border", "1")

  const tr = document.createElement("tr")
  // ヘッダー
  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement("th")
    th.textContent = key
    tr.appendChild(th)
  })
  const thButton = document.createElement("th")
  tr.appendChild(thButton)

  table.appendChild(tr)

  // ボディ
  data.forEach((row) => {
    const tr = document.createElement("tr")
    Object.keys(data[0]).forEach((key) => {
      const td = document.createElement("td")
      td.textContent = row[key]
      tr.appendChild(td)
    })
    const td = document.createElement("td")
    const button = document.createElement("button")
    button.textContent = "取得"
    button.addEventListener(
      "click",
      () => {
        alert(row[0])
      },
      false
    )
    td.appendChild(button)
    tr.appendChild(td)
    table.appendChild(tr)
  })

  // 生成したtable要素を追加する
  const mainTable = document.getElementById("main_table")
  mainTable.innerHTML = ""
  mainTable.appendChild(table)
}

function addRow() {
  let tbl = document.getElementById("tbl")

  let name = ["山田太郎", "斎藤花子", "最上祐樹"]
  let todo = ["メール対応", "会議", "資料作成", "掃除"]

  //input type=dateをtrに追加
  let tr = document.createElement("tr")
  let dateTd = document.createElement("td")
  let dateinp = document.createElement("input")
  //↑上記で必要な要素（tr,td,input）を用意

  dateinp.setAttribute("type", "date") //inputを日付形式に
  dateTd.appendChild(dateinp) //tdに追加
  tr.appendChild(datetd)

  //下記、createSelect関数に、配列、tr、tblを渡す
  createSelect(name, tr, tbl)
  createSelect(todo, tr, tbl)

  tbl.appendChild(tr)
}

/**
 *
 */
const addBox = () => {
  const elements = document.getElementById("input_box")
  const copied = elements.lastElementChild.cloneNode(true)
  let i = elements.childElementCount + 1
  copied.childNodes.forEach((node) => {
    if (node.id) {
      if (node.id.indexOf("url_text_") !== -1) {
        console.log
        node.id = "url_text_" + i
      } else if (node.id.indexOf("output_") !== -1) {
        node.id = "output_" + i
      } else {
        node.id = i
      }
      if (node.value) {
        // URLの値を削除
        node.value = ""
      }
    }
  })
  elements.appendChild(copied)
}

/**
 * APIキー
 */
const API_KEY = ""

/**
 * APIリクエスト
 * @param {*} url URL
 * @param {*} type GET,POST等のタイプ
 * @param {*} data リクエストボディ
 * @returns
 */
const requestAPI = async (url, type, data = {}) => {
  const body = ["POST", "PUT"].includes(type) ? JSON.stringify(data) : null
  console.time("API" + url)
  const response = await fetch(url, {
    method: type,
    headers: {
      "Content-Type": "application/json",
      // "X-API-KEY": API_KEY,
    },
    body,
  })
  console.timeEnd("API" + url)
  return response.json()
}

/**
 * ローカルストレージに値を保存
 */
const saveLocalStorage = () => {
  const elements = document.getElementById("input_box")
  for (let i = 0; i < elements.childElementCount; i++) {
    console.log(`url_text_${i + 1}`)
    saveText(`url_text_${i + 1}`)
  }
  localStorage.setItem("total_count", elements.childElementCount.toString())
}

/**
 * ローカルストレージの値をファイルに保存
 */
const outputLocalStorage = () => {
  const outArray = []
  const elements = document.getElementById("input_box")
  for (let i = 0; i < elements.childElementCount; i++) {
    outArray.push(loadValueFromLocalStorage(`url_text_${i + 1}`))
  }
  const outObject = Object.fromEntries(outArray)
  const outText = JSON.stringify(outObject)
  saveFile(outText)
}

/**
 * ファイルから取得した値をローカルストレージに保存
 * @param {*} text 文字列
 */
const setValueFromFile = (text) => {
  const object = JSON.parse(text)
  Object.keys(object).forEach((key) => {
    localStorage.setItem(key, object[key])
  })
}

/**
 * ローカルストレージにある値を一括でテキストエレメントに設定
 */
const setValuesFromLocalStorage = () => {
  const totalCount = localStorage.getItem("total_count")
  if (totalCount) {
    for (let i = 0; i < Number(totalCount); i++) {
      const key = `url_text_${i + 1}`
      if (!document.getElementById(key)) {
        addBox()
      }
      setValueFromLocalStorage(key)
    }
  }
}

/**
 * ローカルストレージにある値をテキストエレメントに設定
 * @param {*} key
 */
const setValueFromLocalStorage = (key) => {
  document.getElementById(key).value = localStorage.getItem(key)
}

/**
 * ローカルストレージから値を取得
 * @param {*} key
 * @returns
 */
const loadValueFromLocalStorage = (key) => {
  return [key, localStorage.getItem(key)]
}

/**
 * テキストを保存
 * @param {*} key
 * @returns
 */
const saveText = (key) =>
  localStorage.setItem(key, document.getElementById(key).value)

/**
 * スターウォーズAPIから値を取得するテスト
 */
const getAPI = async (e) => {
  e = e || window.event
  const elem = e.target || e.srcElement
  const elemId = elem.id
  const url = document.getElementById("url_text_" + elemId).value
  const result = await requestAPI(url, "GET")
  let json = JSON.stringify(result, null, "\t")
  const textElement = document.getElementById("output_" + elemId)
  textElement.innerHTML = json
}

/** 連続送信の際のカウントアップ数(ミリ秒) */
const COUNT_UP_MS = 100
/** 全WebSocket受信データ */
const wsReceived = []
/** 四角形WebSocket受信データ */
const wsRectangle = []
/** 一時停止か否か */
let isStopped = false
/** BoolStore */
const boolValues = new Map([
  ["filter", false], // フィルター
])

/**
 * テキストを設定
 *
 * @param {string} key キー
 * @param {string} value 値
 */
const setText = (key, value) => {
  document.getElementById(key).innerText = value
}

/** 新WebSocketモードか否か */
const isNewWsMode = () => document.getElementById("mode").checked

/**
 * 日付をフォーマット
 *
 * @param {date} date 時刻
 * @param {string} formatIn フォーマット
 * @returns {string} フォーマット後時刻
 */
const formatDate = (date, formatIn) => {
  let format = formatIn
  format = format.replace(/yyyy/g, date.getFullYear())
  format = format.replace(/MM/g, `0${date.getMonth() + 1}`.slice(-2))
  format = format.replace(/dd/g, `0${date.getDate()}`.slice(-2))
  format = format.replace(/HH/g, `0${date.getHours()}`.slice(-2))
  format = format.replace(/mm/g, `0${date.getMinutes()}`.slice(-2))
  format = format.replace(/ss/g, `0${date.getSeconds()}`.slice(-2))
  format = format.replace(/SSS/g, `00${date.getMilliseconds()}`.slice(-3))
  return format
}

/** ファイルに保存 */
const saveFile = (text) => {
  if (text.length < 1) {
    alert("保存するデータがありません")
    return
  }
  const blob = new Blob([text], { type: "text/plain" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `storage_${formatDate(new Date(), "yyyyMMddHHmmss")}.json`
  link.click()
}

/**
 * クリア
 */
const clearTextRcv = () => {
  const textElem = document.querySelector("#output")
  textElem.innerHTML = ""
  if (window.confirm("ファイルを保存しますか？")) saveFile()
  wsReceived.splice(0)
  wsRectangle.splice(0)
}

/**
 * クリップボードにコピー
 */
const copyToClipboard = () => {
  // コピー対象をJavaScript上で変数として定義する
  const copyTarget = document.getElementById("output")
  // コピー対象のテキストを選択する
  copyTarget.select()
  // 選択しているテキストをクリップボードにコピーする
  document.execCommand("copy")
}

/**
 * テキスト取得
 */
const getText = () => document.getElementById("input").value

/**
 * データ送信
 */
const sendData = (dataRaw) => {
  let data = dataRaw
  if (isNewWsMode()) data = { data: [data] }
  this.connection.send(JSON.stringify(data))
}

/**
 * テキスト通常送信
 */
const sendText = () => {
  const msg = getText()
  let text = ""
  try {
    text = JSON.parse(msg)
  } catch (e) {
    text = msg
  }

  sendData(text)
  document.getElementById("input").innerHTML = ""
}

/**
 * データ表示
 */
const showData = () => {
  setText("text_count", wsReceived.length)
  if (isStopped) return
  const textElem = document.querySelector("#output")
  if (boolValues.get("filter")) {
    textElem.innerHTML = wsRectangle.join("\n")
  } else {
    textElem.innerHTML = wsReceived.join("\n")
  }
}

/**
 * チェックボックス状態変更
 *
 * @param {string} key キー
 */
const handleCheckBoxChanged = (key) => {
  boolValues.set(key, document.getElementById(key).checked)
  localStorage.setItem(key, boolValues.get(key))
}

/**
 * 停止ボタンハンドラ
 */
const handleStopped = () => {
  isStopped = !isStopped
}

/**
 * ローカルストレージから値を取得
 */
const getLocalStorageData = () => {
  // フィルター設定
  const value = localStorage.getItem("filter") === "true"
  boolValues.set("filter", value)
  document.getElementById("filter").checked = value
}

/**
 * WebSocketメッセージ受信ハンドラ
 *
 * @param {string} data 受信データ
 */
const handleReceivedMessage = (receivedData) => {
  const header = `[${formatDate(new Date(), "yyyy-MM-dd HH:mm:ss.SSS")}] [D] `
  try {
    const checkData = JSON.parse(receivedData)
    checkData.data.forEach((value, index, array) => {
      if (checkData.data[index].rectangles) {
        wsRectangle.push(
          `${header}${JSON.stringify(checkData.data[index].rectangles)}`
        )
      }
    })
  } catch {
    console.error("parse Error")
  }
  wsReceived.push(`${header}${receivedData}`)
  showData()
}

// eslint-disable-next-line no-extra-semi
;(() => {
  document.addEventListener("DOMContentLoaded", () => {
    setValuesFromLocalStorage()
    // getLocalStorageData()
    // // クエリパラメーター取得
    // const wsMode = true // TODO: プロジェクト毎に設定
    // const url = wsMode ? "ws://●本番" : "ws://●テスト"
    // this.connection = new WebSocket(url)
    // if (wsMode) setText("ws_mode", "本番")
    // // WebSocket通信が接続された場合
    // this.connection.onopen = () => {
    //   setText("ws_status", "ON")
    // }
    // // エラーが発生した場合
    // this.connection.onerror = (error) => {
    //   setText("ws_status", "OFF")
    //   alert("websocket error", error)
    // }
    // // メッセージを受け取った場合
    // this.connection.onmessage = (e) => {
    //   handleReceivedMessage(e.data)
    // }
    // // 通信が切断された場合
    // this.connection.onclose = () => {
    //   setText("ws_status", "OFF")
    // }
  })

  // // ファイルが選択されたら実行
  // document.getElementById("upload_file").addEventListener("change", (e) => {
  //   const fileReader = new FileReader()
  //   // ファイルの読み込みを行ったら実行
  //   fileReader.addEventListener("load", (loadEvent) => {
  //     document.getElementById("input").value = loadEvent.target.result
  //   })
  //   fileReader.readAsText(e.target.files[0])
  // })
})()
