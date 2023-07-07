(ns complete)

(def API_KEY js/process.env.OPENAI_API_KEY)

(def COMPLETION_API_URL "https://api.openai.com/v1/completions")

(defn http-post [url bearer payload]
  (js/fetch url (clj->js {:method "POST"
                          :headers {"Content-Type" "application/json"
                                    "Authorization" (str "Bearer " bearer)}
                          :body (js/JSON.stringify (clj->js payload))})))

;; https://platform.openai.com/docs/api-reference/completions
(defn call-complete-api [prompt]
  (let [payload {:prompt prompt :model "text-davinci-003" :max_tokens 80}
        promise (http-post COMPLETION_API_URL API_KEY payload)]
    (.then promise (fn [response] (.json response)))))

(defn print-answer [resolved]
  (let [response (js->clj resolved :keywordize-keys true)
        answer (-> response :choices first :text)]
    (js/console.log answer)))

(defn panic [failure]
  (js/console.error "Fatal error:" failure)
  (js/process.exit -1))

(defn llm-complete [prompt]
  (let [promise (call-complete-api prompt)]
    (.then promise print-answer panic)))

(def cli-args
  (not-empty (js->clj (.slice js/process.argv 3))))

(defn main [args]
  (if (empty? API_KEY)
    (js/console.error "No API key, please set OPENAPI_API_KEY!")
    (let [prompt (first args)]
      (if (empty? prompt)
        (js/console.log "Usage: complete 'some text'")
        (llm-complete prompt)))))

(main cli-args)

(comment

  (llm-complete "Pada tanggal 17 Agustus 1945 di Jakarta ")

  (llm-complete "Jumlah penduduk ibukota Jawa Barat")

  (llm-complete "Perang Diponegoro dipimpin oleh")

  ;; moar playground
  )