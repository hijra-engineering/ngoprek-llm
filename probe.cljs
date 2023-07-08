(ns probe)

(def API_KEY js/process.env.OPENAI_API_KEY)

(def CHAT_API_URL "https://api.openai.com/v1/chat/completions")

(defn http-post [url bearer payload]
  (js/fetch url (clj->js {:method "POST"
                          :headers {"Content-Type" "application/json"
                                    "Authorization" (str "Bearer " bearer)}
                          :body (js/JSON.stringify (clj->js payload))})))

(defn mock-weather [location]
  {:location location
   :temperature-celcius 27
   :current-condition ["sunny"]})

(defn mock-visit [city]
  (cond
    (= city "Bandung") [{:date "2023-07-07"} {:date "2022-11-5"}]
    (= city "Jakarta") [{:date "2023-07-26"}]))

(def function-defs
  [{:name "weather"
    :description "Get the current weather in a given location"
    :parameters {:type :object
                 :required ["location"]
                 :properties {:location
                              {:type :string
                               :description "The name of the city, e.g. New York"}}}}
   {:name "visit"
    :description "Get the list of past visits to a specific city"
    :parameters {:type :object
                 :required ["city"]
                 :properties {:city
                              {:type :string
                               :description "The name of the city, e.g. Jakarta"}}}}])

(defn initial-messages [question]
  [{:role "system"
    :content "You are a helpful assistant."}
   {:role "system"
    :content "Answer in 50 words or less."}
   {:role "user"
    :content question}])

;; https://platform.openai.com/docs/guides/gpt/function-calling
(defn call-chat-api [messages functions]
  (let [payload {:model "gpt-3.5-turbo-0613" :messages messages :functions functions}
        promise (http-post CHAT_API_URL API_KEY payload)]
    (.then promise (fn [response] (.json response)))))

(defn dispatch-function [name args]
  (cond
    (= name "weather") (mock-weather (:location args))
    (= name "visit") (mock-visit (:city args))
    :else (js/console.error (str "Unknown function" name))))

(defn invoke-function [func]
  (let [name (:name func)
        args (js->clj (js/JSON.parse (:arguments func)) :keywordize-keys true)]
    {:role "function"
     :name name
     :content (-> (dispatch-function name args) clj->js js/JSON.stringify)}))

(defn converse [function-defs messages]
  (if (> (count messages) 20)
    (js/console.error "Too lengthy conversation!")
    (let [promise (call-chat-api messages function-defs)]
      (.then
       promise
       (fn [resolved]
         (let [response (js->clj resolved :keywordize-keys true)
               assistant-message (-> response :choices first :message)]
           (if (some? (:content assistant-message))
             (js/console.log (:content assistant-message))
             (converse function-defs
                       (conj messages
                             assistant-message
                             (invoke-function (:function_call assistant-message)))))))))))

(defn llm-probe [question]
  (converse function-defs (initial-messages question)))

(def cli-args
  (not-empty (js->clj (.slice js/process.argv 3))))

(defn main [args]
  (if (empty? API_KEY)
    (js/console.error "No API key, please set OPENAPI_API_KEY!")
    (let [prompt (first args)]
      (if (empty? prompt)
        (js/console.log "Usage: probe 'some text'")
        (llm-probe prompt)))))

(main cli-args)

(comment

  (llm-probe "Apakah ibukota Jawa Barat?")
  (llm-probe "Ibukota Jawa Timur adalah?")

  (llm-probe "Bagaimana cuaca di Bandung?")
  (llm-probe "Berapa suhu di Bandung?")

  (llm-probe "Kapan saya terakhir ke Bandung?")
  (llm-probe "Kapan saya terakhir ke ibukota Jawa Barat?")
  (llm-probe "Kapan saya terakhir ke Bandung di tahun 2022?")
  (llm-probe "Cari bulan and tahun saya terakhir mengunjungi ibukota Jawa Barat")

  ;; moar playground
  )