import {IonButton, IonItem, IonText} from "@ionic/react";
import s from '../../style.module.css'
import {addChart} from "../../../../functions/addChart";

interface AddCommentMessageProps {
  addCommentItemShowed: boolean,
  setMoistAddCommentModal: any
}

export const AddCommentMessage: React.FC<AddCommentMessageProps> = ({addCommentItemShowed, setMoistAddCommentModal}) => {
  const onNowClick = () => {
    addChart(new Date(), setMoistAddCommentModal)
  }
  return (
    <IonItem style={addCommentItemShowed ? {display: 'block'} : {display: 'none'}} className={s.addCommentMessageContainer}>
      <IonText className={s.addCommentMessage}>Click on chart to select comment date position or press <IonButton fill={'solid'} onClick={onNowClick}>Now</IonButton> to place comment on latest data comment</IonText>
    </IonItem>
  )
}