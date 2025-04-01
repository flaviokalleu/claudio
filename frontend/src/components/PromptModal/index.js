import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { Eye, EyeOff, X, Save } from "lucide-react";
import { i18n } from "../../translate/i18n";
import QueueSelectSingle from "../QueueSelectSingle";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const PromptSchema = Yup.object().shape({
    name: Yup.string()
        .min(5, "Muito curto!")
        .max(100, "Muito longo!")
        .required("Obrigatório"),
    prompt: Yup.string()
        .min(50, "Muito curto!")
        .required("Descreva o treinamento para Inteligência Artificial"),
    voice: Yup.string().required("Informe o modo para Voz"),
    model: Yup.string().required("Informe o modelo"),
    max_tokens: Yup.number().required("Informe o número máximo de tokens"),
    temperature: Yup.number().required("Informe a temperatura"),
    apikey: Yup.string().required("Informe a API Key"),
    queueId: Yup.number().required("Informe a fila"),
    max_messages: Yup.number().required("Informe o número máximo de mensagens")
});

const PromptModal = ({ open, onClose, promptId }) => {
    const [selectedVoice, setSelectedVoice] = useState("texto");
    const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo-1106");
    const [showApiKey, setShowApiKey] = useState(false);

    const initialState = {
        name: "",
        prompt: "",
        voice: "texto",
        model: "gpt-3.5-turbo-1106",
        voiceKey: "",
        voiceRegion: "",
        maxTokens: 100,
        temperature: 1,
        apiKey: "",
        queueId: null,
        maxMessages: 10
    };

    const [prompt, setPrompt] = useState(initialState);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                return;
            }
            try {
                const { data } = await api.get(`/prompt/${promptId}`);
                setPrompt(prevState => ({ ...prevState, ...data }));
                setSelectedVoice(data.voice);
                setSelectedModel(data.model || "gpt-3.5-turbo-1106");
            } catch (err) {
                toastError(err);
            }
        };
        fetchPrompt();
    }, [promptId, open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedVoice("texto");
        setSelectedModel("gpt-3.5-turbo-1106");
        setShowApiKey(false);
        onClose();
    };

    const handleSavePrompt = async values => {
        const promptData = { ...values, voice: selectedVoice, model: selectedModel };
        if (!values.queueId) {
            toastError("Informe o setor");
            return;
        }
        try {
            if (promptId) {
                await api.put(`/prompt/${promptId}`, promptData);
            } else {
                await api.post("/prompt", promptData);
            }
            toast.success(i18n.t("promptModal.success"));
            handleClose();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <>
            {open && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {promptId
                                    ? i18n.t("promptModal.title.edit")
                                    : i18n.t("promptModal.title.add")}
                            </h2>

                            <Formik
                                initialValues={prompt}
                                enableReinitialize={true}
                                validationSchema={PromptSchema}
                                onSubmit={(values, actions) => {
                                    setTimeout(() => {
                                        handleSavePrompt(values);
                                        actions.setSubmitting(false);
                                    }, 400);
                                }}
                            >
                                {({ touched, errors, isSubmitting }) => (
                                    <Form className="space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Field
                                                    name="name"
                                                    placeholder={i18n.t("promptModal.form.name")}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                />
                                                {touched.name && errors.name && (
                                                    <span className="text-red-500 text-sm mt-1">{errors.name}</span>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <Field
                                                    name="apiKey"
                                                    type={showApiKey ? "text" : "password"}
                                                    placeholder={i18n.t("promptModal.form.apikey")}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12 transition-all duration-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowApiKey(!showApiKey)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                                {touched.apiKey && errors.apiKey && (
                                                    <span className="text-red-500 text-sm mt-1">{errors.apiKey}</span>
                                                )}
                                            </div>

                                            <div>
                                                <Field
                                                    as="textarea"
                                                    name="prompt"
                                                    placeholder={i18n.t("promptModal.form.prompt")}
                                                    rows={8}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y transition-all duration-200"
                                                />
                                                {touched.prompt && errors.prompt && (
                                                    <span className="text-red-500 text-sm mt-1">{errors.prompt}</span>
                                                )}
                                            </div>

                                            <QueueSelectSingle />

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <select
                                                        name="voice"
                                                        value={selectedVoice}
                                                        onChange={e => setSelectedVoice(e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                                                    >
                                                        <option value="texto">Texto</option>
                                                        <option value="pt-BR-FranciscaNeural">Francisca</option>
                                                        <option value="pt-BR-AntonioNeural">Antônio</option>
                                                        <option value="pt-BR-BrendaNeural">Brenda</option>
                                                        <option value="pt-BR-DonatoNeural">Donato</option>
                                                        <option value="pt-BR-ElzaNeural">Elza</option>
                                                        <option value="pt-BR-FabioNeural">Fábio</option>
                                                        <option value="pt-BR-GiovannaNeural">Giovanna</option>
                                                        <option value="pt-BR-HumbertoNeural">Humberto</option>
                                                        <option value="pt-BR-JulioNeural">Julio</option>
                                                        <option value="pt-BR-LeilaNeural">Leila</option>
                                                        <option value="pt-BR-LeticiaNeural">Letícia</option>
                                                        <option value="pt-BR-ManuelaNeural">Manuela</option>
                                                        <option value="pt-BR-NicolauNeural">Nicolau</option>
                                                        <option value="pt-BR-ValerioNeural">Valério</option>
                                                        <option value="pt-BR-YaraNeural">Yara</option>
                                                    </select>
                                                    {touched.voice && errors.voice && (
                                                        <span className="text-red-500 text-sm mt-1">{errors.voice}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <Field
                                                        name="voiceKey"
                                                        placeholder={i18n.t("promptModal.form.voiceKey")}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                    />
                                                </div>

                                                <div>
                                                    <Field
                                                        name="voiceRegion"
                                                        placeholder={i18n.t("promptModal.form.voiceRegion")}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <select
                                                        name="model"
                                                        value={selectedModel}
                                                        onChange={e => setSelectedModel(e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                                                    >
                                                        <option value="gpt-3.5-turbo-1106">GPT 3.5 Turbo</option>
                                                        <option value="gpt-4o-mini">GPT 4.0</option>
                                                    </select>
                                                    {touched.model && errors.model && (
                                                        <span className="text-red-500 text-sm mt-1">{errors.model}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <Field
                                                        name="temperature"
                                                        type="number"
                                                        step="0.1"
                                                        placeholder={i18n.t("promptModal.form.temperature")}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                    />
                                                    {touched.temperature && errors.temperature && (
                                                        <span className="text-red-500 text-sm mt-1">{errors.temperature}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <Field
                                                        name="maxTokens"
                                                        type="number"
                                                        placeholder={i18n.t("promptModal.form.max_tokens")}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                    />
                                                    {touched.maxTokens && errors.maxTokens && (
                                                        <span className="text-red-500 text-sm mt-1">{errors.maxTokens}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Field
                                                        name="maxMessages"
                                                        type="number"
                                                        placeholder={i18n.t("promptModal.form.max_messages")}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                    />
                                                    {touched.maxMessages && errors.maxMessages && (
                                                        <span className="text-red-500 text-sm mt-1">{errors.maxMessages}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                disabled={isSubmitting}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                                            >
                                                <X size={20} />
                                                {i18n.t("promptModal.buttons.cancel")}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-400 relative"
                                            >
                                                <Save size={20} />
                                                {promptId
                                                    ? i18n.t("promptModal.buttons.okEdit")
                                                    : i18n.t("promptModal.buttons.okAdd")}
                                                {isSubmitting && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PromptModal;