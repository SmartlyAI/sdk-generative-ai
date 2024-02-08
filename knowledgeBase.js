'use strict'

const axios = require('axios');
const {
    Validator
} = require('jsonschema');

const config = require('./config/config.js');


class KnowledgeBase {

    constructor() {
        this.token = config.token;
        this.baseUrl = config.baseUrl;
    }

    async getKnowledgeBase(knowledgeId) {
        try {
            const response = await axios.get(`${this.baseUrl}/assistant_knowledges/${knowledgeId}`, {
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            });
            return response.data;
        } catch (error) {
            this.handlerError(error);
            return null;
        }
    }

    async createKnowledgeBase(KnowledgeBaseData) {
        try {
            const response = await axios.post(`${this.baseUrl}/assistant_knowledges`,
                KnowledgeBaseData, {
                    headers: {
                        'Authorization': 'Bearer ' + this.token
                    }
                });
            return response.data;

        } catch (error) {
            this.handlerError(error);
            return null;
        }
    }

    async updateKnowledgeBase(knowledgeId, updatedKnowledgeBaseData) {
        try {
            const response = await axios.put(`${this.baseUrl}/assistant_knowledges/${knowledgeId}`,
                updatedKnowledgeBaseData, {
                    headers: {
                        'Authorization': 'Bearer ' + this.token
                    }
                });
            return response.data;
        } catch (error) {
            this.handlerError(error);
            return null;
        }
    }

    async deleteKnowledgeBase(knowledgeId) {
        try {
            const response = await axios.delete(`${this.baseUrl}/assistant_knowledges/${knowledgeId}`, {
                headers: {
                    'Authorization': 'Bearer ' + this.token
                }
            });
            return response.data;
        } catch (error) {
            this.handlerError(error);
            return null;
        }
    }

    handlerError(error) {
        if (error.response) {
            console.error('Error status code:', error.response.status);
            // console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('No response received from server.');
        } else {
            console.error('Error :', error);
        }
    }

    validateKnowledgeBase(knowledgeBase) {
        const schema = {
            type: 'object',
            properties: {
                reranking: {
                    type: 'object',
                    properties: {
                        weighting_multiplier_coefficient: {
                            type: 'number'
                        }
                    },
                    required: ['weighting_multiplier_coefficient']
                },
                search: {
                    type: 'object',
                    properties: {
                        chunk_overlap: {
                            type: 'number'
                        },
                        chunk_size: {
                            type: 'number'
                        },
                        chunking_method: {
                            type: 'string'
                        }
                    },
                    required: ['chunk_overlap', 'chunk_size', 'chunking_method']
                },
                scrapping: {
                    type: 'object',
                    properties: {
                        selector: {
                            type: 'string'
                        },
                        library: {
                            type: 'string'
                        },
                        waiting_time_for_web_scraping: {
                            type: 'number'
                        }
                    },
                    required: ['selector', 'library', 'waiting_time_for_web_scraping']
                },
                source: {
                    type: 'object',
                    properties: {
                        sources: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    url: {
                                        type: 'string'
                                    },
                                    name: {
                                        type: 'string'
                                    },
                                    _id: {
                                        type: 'string'
                                    },
                                    metadata: {
                                        type: 'string'
                                    },
                                    data: {
                                        type: 'string'
                                    },
                                    type: {
                                        type: 'string'
                                    }
                                },
                                required: ['name', 'data', 'type']
                            }
                        }
                    },
                    required: ['sources']
                },
                name: {
                    type: 'string'
                }
            },
            required: [
                'reranking', 'search', 'scrapping', 'source', 'name'
            ]
        };

        const validator = new Validator();
        const validationResult = validator.validate(knowledgeBase, schema);
        return validationResult.valid;
    }

    defaultKnowledgeBase(name, sources) {
        return {
            "reranking": {
                "weighting_multiplier_coefficient": 1
            },
            "search": {
                "chunk_overlap": 100,
                "chunk_size": 1800,
                "chunking_method": "fixed_size"
            },
            "scrapping": {
                "selector": "",
                "library": "Cheerio",
                "waiting_time_for_web_scraping": 0
            },
            "source": {
                "sources": sources
            },
            "name": name
        }
    }

}

module.exports = KnowledgeBase;