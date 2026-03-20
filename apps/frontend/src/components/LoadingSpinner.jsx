import Spinner from "react-bootstrap/Spinner";

export default function LoadingSpinner({ size = "sm" }) {
  return (
    <Spinner animation="border" role="status" size={size}>
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}