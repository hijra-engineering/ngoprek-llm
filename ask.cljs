(ns ask)

(def API_KEY js/process.env.OPENAI_API_KEY)

(def CHAT_API_URL "https://api.openai.com/v1/chat/completions")

(defn http-post [url bearer payload]
  (js/fetch url (clj->js {:method "POST"
                          :headers {"Content-Type" "application/json"
                                    "Authorization" (str "Bearer " bearer)}
                          :body (js/JSON.stringify (clj->js payload))})))

;; https://platform.openai.com/docs/api-reference/chat
(defn call-chat-api [messages]
  (let [payload {:model "gpt-3.5-turbo" :messages messages}
        promise (http-post CHAT_API_URL API_KEY payload)]
    (.then promise (fn [response] (.json response)))))

(defn print-answer [resolved]
  (let [response (js->clj resolved :keywordize-keys true)
        answer (-> response :choices first :message :content)]
    (js/console.log answer)))

(defn initial-messages [question]
  [{:role "system"
    :content "You are a helpful assistant."}
   {:role "system"
    :content "Answer in 50 words or less."}
   {:role "user"
    :content question}])

(defn llm-ask [question]
  (let [promise (call-chat-api (initial-messages question))]
    (.then promise print-answer)))

(def cli-args
  (not-empty (js->clj (.slice js/process.argv 3))))

(defn main [args]
  (if (empty? API_KEY)
    (js/console.error "No API key, please set OPENAPI_API_KEY!")
    (let [prompt (first args)]
      (if (empty? prompt)
        (js/console.log "Usage: ask 'some text'")
        (llm-ask prompt)))))

(main cli-args)

(comment

  (llm-ask "Berapa jumlah penduduk Jakarta?")

  (llm-ask "Apa ibukota Jawa Timur?")

  (llm-ask "What's the capital of East Java?")

  (llm-ask "Was ist die Hauptstadt von Ostjava?")

  ;; moar playground
  )