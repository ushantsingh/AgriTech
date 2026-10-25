import { Spinner } from 'react-bootstrap';

export default function LoadingSpinner() {
  return (
    <div className="spinner-wrapper">
      <Spinner animation="border" variant="success" />
    </div>
  );
}
