'use strict'


const FileHelper = require('./fileHelper');
const config = require('./config/config.js');
const KnowledgeBase = require('./knowledgeBase');

class Main {
    constructor() {
        this.directoryPath = config.directoryPath;
    }

    async start() {
        try {
            const fileHelper = new FileHelper();

            // await fileHelper.createDocumentKnowledge(this.directoryPath + '/document');

            let kb = await fileHelper.createWebsiteKnowledge(this.directoryPath + '/web-site/Web KB.csv');

            let knowledgeId = kb._id;
            console.log("knowledgeId : ", knowledgeId);

            const knowledgeBase = new KnowledgeBase();

            let myKnowledge = await knowledgeBase.getKnowledgeBase(knowledgeId);
            console.log("myKnowledge : ", myKnowledge);

            myKnowledge.name = 'New Name';
            await knowledgeBase.updateKnowledgeBase(knowledgeId, myKnowledge);


            // await knowledgeBase.deleteKnowledgeBase(knowledgeId);


        } catch (error) {
            console.error('[MAIN] [ERROR] :', error);
        }
    }

}

const main = new Main();
const start = main.start();