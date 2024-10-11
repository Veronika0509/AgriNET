import {IonButton, IonIcon} from "@ionic/react";
import {chatbubblesOutline} from "ionicons/icons";
import React from "react";

interface AddCommentButtonProps {
  addCommentItemShowed: boolean,
  setAddCommentItemShowed: any
}

export const AddCommentButton: React.FC<AddCommentButtonProps> = ({addCommentItemShowed, setAddCommentItemShowed}) => {
  return (
    <IonButton style={{height: '36px'}} onClick={() => setAddCommentItemShowed(!addCommentItemShowed)} fill={addCommentItemShowed ? 'outline' : 'solid'}>
      <IonIcon slot="start" icon={chatbubblesOutline}></IonIcon>
      {addCommentItemShowed ? 'Cancel Comment Adding' : 'Add Comment'}
    </IonButton>
  )
}