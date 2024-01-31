import React, { useState, useEffect } from 'react';
import '@ionic/react/css/core.css';
import Loading from './Loading';
import App from './App';
import useSQLiteDB from "./useSQLiteDB";
import { DarkModeProvider } from './containers/DarkModeContext';

function Main() {

    const [isLoading, setIsLoading] = useState(true);
    const { performSQLAction, initialized ,restartDB } = useSQLiteDB();
    const [katakanaData, setKatakanaData] = useState({});
    const [hiraganaData, setHiraganaData] = useState({});
    const [kanjiData, setKanjiData] = useState({});
    const [currentPage, setCurrentPage] = useState('hiragana');

    useEffect(() => {
        if (initialized) {
            loadData("full");
            setIsLoading(false);
        }
    }, [initialized]);

    const loadData = async (mode) => {
        try {
            performSQLAction(async (db) => {
                const tables = JSON.stringify(await db?.query(`SELECT name FROM sqlite_schema WHERE type ='table'`));
                console.log('Tables in db: ' + tables)
                const hiragana = JSON.stringify(await db?.query(`Select * from charProgressionHiragana`));
                console.log('Hiragana Table: ' + hiragana)
                const katakana = JSON.stringify(await db?.query(`Select * from charProgressionKatakana`));
                console.log('Katakana Table: ' + katakana)
                const kanji = JSON.stringify(await db?.query(`Select * from charProgressionKanji`));
                console.log('Kanji Table: ' + kanji)
                setKatakanaData(JSON.parse(katakana))
                setHiraganaData(JSON.parse(hiragana))
                setKanjiData(JSON.parse(kanji))
            });
        } catch (error) {
            console.log((error).message);
        }
    };

    /* Needs to be improved - template only */
    const checkUnlock = async (table) => {
        try {
            await performSQLAction(async (db) => {
                //const fullCount = await db?.query(`SELECT count(*) AS count from ${table}`);
                //console.log(fullCount.values[0].count)
                const unlockedCount = await db?.query(`SELECT count(*) AS count from ${table} where level > 0`);
                const levelCount = await db?.query(`SELECT sum(level) AS count from ${table} where level > 0`);
                if ((levelCount.values[0].count / unlockedCount.values[0].count) > 10) {
                    const newChars = await db?.query(`SELECT character from ${table} where level = 0`);
                    const toUnlock = newChars.values.slice(0, 5)
                    for (let i = 0; i < toUnlock.length; i++) {
                        await db?.query(`UPDATE ${table} SET level = 1 WHERE character = '${toUnlock[i].character}' ;`);
                    }
                }
            });
        } catch (error) {
            console.log((error).message);
        }
    };

    const reload = async (userResponses, currentPage) => {
        setIsLoading(true);
        try {
            await performSQLAction(async (db) => {
                for (let i = 0; i < userResponses.length; i++) {
                    if (userResponses[i][1] === undefined) continue;
                    let count = ["+1",0,20]
                    if (!userResponses[i][1]) count = ["-1",1,21]
                    console.log(`UPDATE charProgression${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} SET level = level ${count[0]} WHERE (character = '${userResponses[i][0]}' or pronunciation = '${userResponses[i][0]}') and level < ${count[2]} and level > ${count[1]};`)
                    await db?.query(`UPDATE charProgression${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} SET level = level ${count[0]} WHERE (character = '${userResponses[i][0]}' or pronunciation = '${userResponses[i][0]}') and level < ${count[2]} and level > ${count[1]};`);
                }
            });
        } catch (error) {
            console.log((error).message);
        }
        await checkUnlock(`charProgression${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}`);
        await loadData(currentPage);
        setCurrentPage(currentPage);
        setIsLoading(false)
    };

    const restart = async () => {
        setIsLoading(true);
        await restartDB();
        setCurrentPage(currentPage);
        setIsLoading(false)
    };

    return (
        <DarkModeProvider>
            <div className="App">
                {isLoading ? (<Loading />) : (<App katakanaData={katakanaData} hiraganaData={hiraganaData} kanjiData={kanjiData} currentPageInherited={currentPage} reload={reload} restart={restart} />)}
            </div>
        </DarkModeProvider>
    );
}

export default Main;