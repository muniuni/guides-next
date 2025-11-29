import React from 'react';
import { TextField, Button, IconButton, Stack, Card, CardContent, CardHeader } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useTranslations } from 'next-intl';
import { QuestionsCardProps } from './types';
import {
  CARD_STYLES,
  CARD_HEADER_STYLES,
  CARD_CONTENT_STYLES,
  BUTTON_STYLES,
  INPUT_HEIGHT_STYLES,
} from './styles';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableQuestionItemProps {
  question: { id: string | null; text: string; leftLabel?: string; rightLabel?: string };
  index: number;
  updateQuestion: (index: number, updates: { text?: string; leftLabel?: string; rightLabel?: string }) => void;
  removeQuestion: (index: number) => void;
}

function SortableQuestionItem({ question, index, updateQuestion, removeQuestion }: SortableQuestionItemProps) {
  const t = useTranslations('projects.edit');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `question-${index}`,
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const,
  };

  return (
    <Stack
      ref={setNodeRef}
      style={style}
      direction="column"
      spacing={2}
      sx={{
        backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        borderRadius: 1,
        p: 2,
        border: isDragging ? '2px solid rgba(25, 118, 210, 0.2)' : '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: isDragging ? '0 8px 24px rgba(0, 0, 0, 0.15)' : 'none',
        opacity: isDragging ? 0.9 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 200ms cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          sx={{
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <DragIndicatorIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </IconButton>
        <TextField
          label={t('questionLabel', { index: index + 1 })}
          value={question.text}
          onChange={(e) => updateQuestion(index, { text: e.target.value })}
          fullWidth
          size="small"
          sx={INPUT_HEIGHT_STYLES}
        />
        <IconButton
          onClick={() => removeQuestion(index)}
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={2} pl={5}>
        <TextField
          label={t('leftLabel')}
          value={question.leftLabel || ''}
          onChange={(e) => updateQuestion(index, { leftLabel: e.target.value })}
          fullWidth
          size="small"
          placeholder={t('leftLabelPlaceholder')}
        />
        <TextField
          label={t('rightLabel')}
          value={question.rightLabel || ''}
          onChange={(e) => updateQuestion(index, { rightLabel: e.target.value })}
          fullWidth
          size="small"
          placeholder={t('rightLabelPlaceholder')}
        />
      </Stack>
    </Stack>
  );
}

export function QuestionsCard({
  questionList,
  addQuestion,
  updateQuestion,
  removeQuestion,
  reorderQuestions,
}: QuestionsCardProps) {
  const t = useTranslations('projects.edit');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace('question-', ''));
      const newIndex = parseInt(over.id.toString().replace('question-', ''));

      // Smooth transition with a slight delay to ensure proper reordering
      setTimeout(() => {
        reorderQuestions(oldIndex, newIndex);
      }, 0);
    }
  };

  const questionIds = questionList.map((_, index) => `question-${index}`);

  return (
    <Card sx={CARD_STYLES}>
      <CardHeader
        title={t('questions')}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button
            startIcon={<AddIcon />}
            onClick={addQuestion}
            size="small"
            sx={{
              ...BUTTON_STYLES,
              mt: 0.5,
            }}
          >
            {t('addQuestion')}
          </Button>
        }
        sx={CARD_HEADER_STYLES}
      />
      <CardContent sx={CARD_CONTENT_STYLES}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
            <Stack spacing={2}>
              {questionList.map((question, index) => (
                <SortableQuestionItem
                  key={`question-${index}`}
                  question={question}
                  index={index}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
