import React, { useState, useCallback, useEffect } from 'react';
import { 
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonAlert
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { saveComment } from './data/saveComment';
import { deleteComment } from './data/deleteComment';
import { 
  CommentItem, 
  CommentSortOption, 
  CommentFormValues,
  CommentModalState,
  SaveCommentParams,
  SortOption
} from '@/types/comments';

// Constants for sort options
const SORT_OPTIONS: Array<SortOption<CommentSortOption>> = [
  { 
    value: 'dateDesc', 
    label: 'Сначала новые',
    isDefault: true 
  },
  { 
    value: 'dateAsc', 
    label: 'Сначала старые'
  },
  { 
    value: 'chartKind', 
    label: 'По типу графика'
  },
  { 
    value: 'type', 
    label: 'По типу комментария'
  }
];

// Default form values with proper type assertion for optional fields
const DEFAULT_FORM_VALUES: Omit<CommentFormValues, 'userId'> = {
  chartKind: '',
  sensorId: '',
  type: 1,
  field: '',
  date: new Date().toISOString().split('T')[0],
  text: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Using global CommentModalState type
const DEFAULT_MODAL_STATE: CommentModalState = {
  isOpen: false,
  comment: null,
  isEditMode: false,
  isLoading: false,
  lastUpdated: Date.now(),
  error: ''
};

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

const INITIAL_PAGINATION: PaginationState = {
  page: 0,
  pageSize: 20,
  total: 0,
  hasMore: true
};

const Comments: React.FC<{ userId: string }> = ({ userId }) => {
  const [presentAlert] = useIonAlert();
  // State management with explicit types
  const [data, setData] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<CommentSortOption>('dateDesc');
  const [formValues, setFormValues] = useState<CommentFormValues>(DEFAULT_FORM_VALUES);
  const [pagination, setPagination] = useState<PaginationState>(INITIAL_PAGINATION);
  // Initialize modal state
  const [modalState, setModalState] = useState<CommentModalState>({
    isOpen: false,
    comment: null,
    isEditMode: false,
    isLoading: false,
    lastUpdated: Date.now(),
    error: ''
  });

  // Memoize sort options to prevent unnecessary re-renders
  const sortOptions = useCallback((): Array<SortOption<CommentSortOption>> => SORT_OPTIONS, []);
  
  // Load comments function
  const loadComments = useCallback(async (page: number, sortBy: CommentSortOption) => {
    try {
      setIsLoading(true);
      // Implementation of loadComments
      // This is a placeholder - implement actual data loading logic here
      const response = await fetch('https://example.com/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sort: sortBy,
          startIndex: page * pagination.pageSize,
          type: 0, // All types
          userId
        })
      });
      
      if (response.ok) {
        const { data, total } = await response.json();
        
        setData(prevData => 
          page === 0 ? data : [...prevData, ...data]
        );
        
        setPagination(prev => ({
          ...prev,
          page,
          total: total || 0,
          hasMore: (page + 1) * prev.pageSize < (total || 0)
        }));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Не удалось загрузить комментарии';
        
      console.error('Error loading comments:', error);
      
      await presentAlert({
        header: 'Ошибка',
        message: errorMessage,
        buttons: ['OK']
      });
      
      // Reset data on error
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [sort, userId, pagination.pageSize, presentAlert]);

  // Handle load more comments
  const loadMore = useCallback(async (ev: CustomEvent<void>) => {
    if (!pagination.hasMore || isLoading) {
      (ev.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }

    try {
      await loadComments(pagination.page + 1, sort);
    } finally {
      (ev.target as HTMLIonInfiniteScrollElement).complete();
    }
  }, [pagination, sort, isLoading, loadComments]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const newSort = value as CommentSortOption;
    setSort(newSort);
    loadComments(0, newSort).catch(err => {
      console.error('Error changing sort:', err);
      presentAlert({
        header: 'Ошибка',
        message: 'Не удалось изменить сортировку',
        buttons: ['OK']
      });
    });
  }, [loadComments, presentAlert]);

  // Handle comment editing
  const handleEdit = useCallback((comment: CommentItem) => {
    setModalState(prev => ({
      ...prev,
      isOpen: true,
      isEditMode: true,
      comment,
      error: '',
      isLoading: false
    }));
    
    // Update form values with proper typing
    setFormValues({
      chartKind: comment.chartKind || '',
      sensorId: comment.sensorId || '',
      type: comment.type || 1,
      field: comment.field || '',
      date: comment.date || new Date().toISOString().split('T')[0],
      text: comment.text || '',
      createdAt: comment.createdAt || new Date().toISOString(),
      updatedAt: comment.updatedAt || new Date().toISOString()
    });
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setModalState(DEFAULT_MODAL_STATE);
    setFormValues(DEFAULT_FORM_VALUES);
  }, []);

  // Handle input changes with proper typing
  const handleInputChange = useCallback((
    field: keyof CommentFormValues, 
    value: string | number | undefined
  ) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle field changes with proper typing
  const handleFieldChange = useCallback((field: keyof CommentFormValues) => 
    (e: CustomEvent) => {
      const value = e.detail.value;
      handleInputChange(field, value);
    },
    [handleInputChange]
  );

  // Handle comment saving
  const handleSave = useCallback(async () => {
    if (!formValues.text?.trim()) {
      setModalState(prev => ({
        ...prev,
        error: 'Пожалуйста, введите текст комментария'
      }));
      return;
    }

    try {
      setModalState(prev => ({ ...prev, isLoading: true, error: '' }));
      
      const commentData: SaveCommentParams = {
        userId: String(userId),
        chartKind: formValues.chartKind || '',
        sensorId: formValues.sensorId || '',
        type: formValues.type || 1,
        field: formValues.field || '',
        date: formValues.date || new Date().toISOString().split('T')[0],
        text: formValues.text,
        opts: {
          userId: String(userId),
          timestamp: Date.now()
        }
      };

      await saveComment(commentData);
      await loadComments(0, sort);
      handleCloseModal();
    } catch (err) {
      console.error('Error saving comment:', err);
      setModalState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Не удалось сохранить комментарий'
      }));
      
      presentAlert({
        header: 'Ошибка',
        message: 'Не удалось сохранить комментарий',
        buttons: ['OK']
      });
    } finally {
      setModalState(prev => ({ ...prev, isLoading: false }));
    }
  }, [formValues, userId, sort, loadComments, handleCloseModal, presentAlert]);

  // Handle delete comment
  const handleDelete = useCallback(async (id: number) => {
    try {
      await presentAlert({
        header: 'Подтверждение',
        message: 'Вы уверены, что хотите удалить этот комментарий?',
        buttons: [
          {
            text: 'Отмена',
            role: 'cancel'
          },
          {
            text: 'Удалить',
            handler: async () => {
              try {
                await deleteComment({ id, userId: String(userId) });
                // Refresh comments after deletion
                await loadComments(0, sort);
              } catch (err) {
                console.error('Error deleting comment:', err);
                await presentAlert({
                  header: 'Ошибка',
                  message: 'Не удалось удалить комментарий',
                  buttons: ['OK']
                });
              }
            }
          }
        ]
      });
    } catch (err) {
      console.error('Error showing delete confirmation:', err);
    }
  }, [presentAlert, userId, sort, loadComments]);

  // Load comments on mount and when sort changes
  useEffect(() => {
    loadComments(0, sort);
  }, [sort, loadComments]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      // Update any responsive state here if needed
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="comments-container">
      {/* Header with title and add button */}
      <IonHeader>
        <IonToolbar>
          <IonTitle>Комментарии</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setModalState(prev => ({ ...prev, isOpen: true }))}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Sort controls */}
        <IonToolbar>
          <IonItem lines="none">
            <IonLabel>Сортировать по:</IonLabel>
            <IonSelect
              value={sort}
              onIonChange={e => handleSortChange(e.detail.value)}
              interface="popover"
            >
              {sortOptions().map((option: SortOption<CommentSortOption>) => (
                <IonSelectOption key={option.value} value={option.value}>
                  {option.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonToolbar>
      </IonHeader>

      {/* Main content */}
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={() => loadComments(0, sort)}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Comments list */}
        {data.length > 0 ? (
          <>
            {data.map(comment => (
              <div key={comment.id} className="comment-item">
                <IonItem lines="full">
                  <IonLabel>
                    <h2>{comment.text}</h2>
                    <p>{new Date(comment.date).toLocaleDateString()}</p>
                    {String(comment.userId) === String(userId) && (
                      <div className="comment-actions">
                        <IonButton fill="clear" size="small" onClick={() => handleEdit(comment)}>
                          Редактировать
                        </IonButton>
                        <IonButton fill="clear" size="small" color="danger" onClick={() => handleDelete(comment.id)}>
                          Удалить
                        </IonButton>
                      </div>
                    )}
                  </IonLabel>
                </IonItem>
              </div>
            ))}
            <IonInfiniteScroll
              onIonInfinite={loadMore}
              threshold="100px"
              disabled={!pagination.hasMore}
            >
              <IonInfiniteScrollContent
                loadingText="Загрузка..."
                loadingSpinner="bubbles"
              />
            </IonInfiniteScroll>
          </>
        ) : (
          <IonText color="medium" className="ion-text-center">
            <p>Нет комментариев</p>
          </IonText>
        )}
      </IonContent>

      {/* Add/Edit Comment Modal */}
      <IonModal
        isOpen={modalState.isOpen}
        onDidDismiss={handleCloseModal}
        className="comment-modal"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {modalState.isEditMode ? 'Редактировать комментарий' : 'Новый комментарий'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleCloseModal}>
                Закрыть
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <IonItem>
              <IonLabel position="floating">Тип</IonLabel>
              <IonSelect
                value={formValues.type}
                onIonChange={handleFieldChange('type')}
                interface="popover"
              >
                <IonSelectOption value={1}>Обычный</IonSelectOption>
                <IonSelectOption value={2}>Важный</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Дата</IonLabel>
              <input
                type="date"
                value={formValues.date}
                onChange={e => handleInputChange('date', e.target.value)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Комментарий</IonLabel>
              <IonTextarea
                value={formValues.text || ''}
                onIonChange={e => handleInputChange('text', e.detail.value || '')}
                rows={4}
                required
              />
            </IonItem>

            {modalState.error && (
              <IonText color="danger">
                <p>{modalState.error}</p>
              </IonText>
            )}

            <div className="ion-margin-top">
              <IonButton 
                type="submit" 
                expand="block" 
                disabled={modalState.isLoading}
              >
                {modalState.isLoading ? 'Сохранение...' : 'Сохранить'}
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="clear" 
                onClick={handleCloseModal}
                className="ion-margin-top"
              >
                Отмена
              </IonButton>
            </div>
          </form>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default Comments;
