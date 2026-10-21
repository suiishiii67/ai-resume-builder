// Pop-up version of ReviewChanges with "Keep mine" and "Accept".
// Closing it (X or Escape) is the same as "Keep mine", unless onClose says otherwise.
import Modal from './Modal'
import Button from './Button'
import ReviewChanges from './ReviewChanges'

function ReviewChangesDialog({ title, items, source, onAccept, onKeep, onClose = onKeep, isSaving = false }) {
  return (
    <Modal
      title={title}
      size="xl"
      onClose={isSaving ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onKeep} disabled={isSaving}>Keep mine</Button>
          <Button onClick={onAccept} loading={isSaving}>Accept</Button>
        </>
      }
    >
      <ReviewChanges items={items} source={source} />
    </Modal>
  )
}

export default ReviewChangesDialog
