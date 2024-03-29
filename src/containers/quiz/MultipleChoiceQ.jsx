import React, { useState } from 'react';
import { IonCol, IonGrid, IonRow} from '@ionic/react';
import QuizGridItem from './QuizGridItem';

const MultipleChoiceQ = ({ onAnswer,data, type }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const handleSelectAnswer = (selection) => {
        setSelectedAnswer(selection.character);
        setTimeout(() => {
            onAnswer(data.rightAnswer, selection.character === data.rightAnswer);
        }, 500);
    };

    const renderAnswerButton = (option, index) => {
        const isCorrect = option === data.rightAnswer;
        const isSelected = selectedAnswer === option;
        return (
            <IonCol size={type === "kanji" ? "12" : "6"} key={index}>
                <QuizGridItem character={option} adjHeight={type === "kanji" ? "40px" : '80px'} borderC={isSelected ? (isCorrect ? 'green' : 'red') : '#ffffff'} onClick={selectedAnswer !== null ? ()=>null : handleSelectAnswer} />
            </IonCol>
        );
    };

    return (
        <div className="multiple-choice question">
            <div>
                <h3>Select the corresponding character(s)</h3>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12">
                            <div className="hiragana-display">
                                <h1>{data.character}</h1>
                            </div>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        {data.others.map((option, index) => renderAnswerButton(option, index))}
                    </IonRow>
                </IonGrid>
            </div>
        </div>
    );
};

export default MultipleChoiceQ;