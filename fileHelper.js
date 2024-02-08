'use strict'

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const config = require('./config/config.js');
const KnowledgeBase = require('./knowledgeBase');


class FileHelper {

    constructor() {
        this.token = config.token;
        this.uploadUrl = config.uploadUrl;
        this.instructionsPath = config.instructionsPath;
    }

    async createDocumentKnowledge(directoryPath) {
        let folders = await this.iterateFolders(directoryPath);
        console.log('Folders:', folders);
        await this.getFilesInFolders(folders);
    }

    async iterateFolders(folderPath) {
        return new Promise(async (resolve, reject) => {
            fs.readdir(folderPath, (err, files) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }

                const folders = [];
                let remaining = files.length;

                if (remaining === 0) {
                    resolve(folders);
                }

                files.forEach(file => {
                    const fullPath = path.join(folderPath, file);
                    fs.stat(fullPath, (err, stats) => {
                        if (err) {
                            console.log(err);
                            resolve(null);
                        }

                        if (stats.isDirectory()) {
                            folders.push({
                                name: file,
                                path: fullPath
                            });
                        }

                        remaining--;
                        if (remaining === 0) {
                            resolve(folders);
                        }
                    });
                });
            });
        });
    }

    async getFilesInFolders(folderList) {
        let results = {};
        let remaining = folderList.length;

        if (remaining === 0) {
            return;
        }

        for (const folder of folderList) {
            results[folder.name] = [];
            fs.readdir(folder.path, async (err, files) => {
                if (err) {
                    console.log('err : ', err);
                    return;
                }

                for (const file of files) {
                    let data = await this.uploadFile(file, folder.path);
                    let urlOption = await this.findURL(data.name);
                    data.urlOption = urlOption;
                    data.knowledge_name = folder.name;

                    results[folder.name].push(data);
                }

                remaining--;
                if (remaining === 0) {
                    for (const knowledgeName of Object.keys(results)) {
                        let sources = [];
                        results[knowledgeName].forEach(source => {
                            sources.push({
                                "url": source.urlOption,
                                "name": (source.name).replace(/\.[^/.]+$/, ""),
                                "metadata": "",
                                "data": source.url,
                                "type": "document"
                            })
                        })
                        await this.createKnowledgeBase(sources, knowledgeName);
                    }
                }
            });
        }
    }


    async uploadFile(name, file) {
        return new Promise(async (resolve, reject) => {
            const formData = new FormData();
            formData.append('file', fs.createReadStream('./' + file + '/' + name));
            try {
                const response = await axios.post(this.uploadUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + this.token
                    }
                })
                resolve({
                    name: name,
                    url: response.data.file.path
                });

            } catch (error) {
                console.error(`Error uploading file ${file}:`, error);
                resolve({
                    name: name,
                    url: ''
                });
            }
        });
    }

    findURL(fileName) {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(this.instructionsPath, {
                encoding: 'utf-8'
            });
            let found = false;

            readStream.on('data', (chunk) => {
                const lines = chunk.split('\n');
                for (const line of lines) {
                    const values = line.trim().split(' ');
                    if (values[0] + '.html' === fileName) {
                        if (values.length >= 2) {
                            found = true;
                            resolve(values[1]);
                            break;
                        }
                    }
                }
            });

            readStream.on('end', () => {
                if (!found) {
                    resolve('');
                }
            });

            readStream.on('error', (error) => {
                console.log('[ERROR][findURL] : ', error);
                resolve('');
            });
        });
    }

    async createWebsiteKnowledge(filePath) {
        return new Promise(async (resolve, reject) => {
            fs.readFile(filePath, 'utf8', async (err, data) => {
                if (err) {
                    console.error('Error reading the file:', err);
                    return;
                }

                const sources = this.parseCSV(data);
                let name = path.basename(filePath).replace(/\.[^/.]+$/, '');

                let result = await this.createKnowledgeBase(sources, name);
                resolve(result);
            });
        });
    }

    parseCSV(csvString) {
        const rows = csvString.trim().split('\n');
        const objects = rows.map(row => {
            const values = row.split(',');
            return {
                name: '',
                data: values[0],
                metadata: '',
                type: 'web-site'
            };
        });
        return objects;
    }

    async createKnowledgeBase(sources, name) {
        let result = null;
        const knowledgeBase = new KnowledgeBase();

        let kb = knowledgeBase.defaultKnowledgeBase(name, sources)
        let isValid = knowledgeBase.validateKnowledgeBase(kb);
        if (isValid) {
            result = await knowledgeBase.createKnowledgeBase(kb);
        }
        console.log("====> knowledge : ", result.knowledge);
        return result.knowledge;
    }

}



module.exports = FileHelper;