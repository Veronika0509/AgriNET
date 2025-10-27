import {IonButton, IonIcon} from "@ionic/react";
import {chatbubblesOutline} from "ionicons/icons";
import React from "react";

interface AddCommentButtonProps {
  addCommentItemShowed: boolean,
  setAddCommentItemShowed: (value: boolean) => void,
  isCommentsShowed: boolean,
  setIsCommentsShowed: (value: boolean) => void
}

export const AddCommentButton: React.FC<AddCommentButtonProps> = ({addCommentItemShowed,
                                                                    setAddCommentItemShowed,
                                                                    isCommentsShowed,
                                                                    setIsCommentsShowed}) => {
  const onAddCommentButtonClickClick = () => {
    setAddCommentItemShowed(!addCommentItemShowed)
    if (!isCommentsShowed) {
      setIsCommentsShowed(true)
    }
  }
  return (
    <IonButton style={{height: '36px'}}
               onClick={onAddCommentButtonClickClick}
               fill={addCommentItemShowed ? 'outline' : 'solid'}>
      <IonIcon slot="start" icon={chatbubblesOutline}></IonIcon>
      {addCommentItemShowed ? 'Cancel Comment Adding' : 'Add Comment'}
    </IonButton>
  )
}