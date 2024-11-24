import {IonButton, IonItem, IonText} from "@ionic/react";
import s from '../../../style.module.css'

interface AddCommentMessageProps {
  type: string,
  addCommentItemShowed: boolean,
  setAddCommentModal: any
}

export const AddCommentMessage: React.FC<AddCommentMessageProps> = ({type, addCommentItemShowed, setAddCommentModal}) => {
  const onNowClick = () => {
    setAddCommentModal({date: new Date(), type})
  }
  return (
    <IonItem style={addCommentItemShowed ? {display: 'block'} : {display: 'none'}} className={s.addComment_messageContainer}>
      <IonText className={s.addComment_message}>Click on chart to select comment date position or press <IonButton fill={'solid'} onClick={onNowClick}>Now</IonButton> to place comment on latest data comment</IonText>
    </IonItem>
  )
}