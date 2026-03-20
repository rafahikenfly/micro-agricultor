import LoadingSpinner from "./LoadingSpinner";

export default function Loading({
  variant = "center",
  height = "200px",
  size = "sm",
}) {
  //EM NAVBAR:     <Loading variant="inline" />
  //EM COMPONENTE: <Loading variant="center" height="300px" size="lg" />
  //EM BOTA:       <Loading variant="button" />
  //EM SELECT:     <Loading variant="inline" />Carregando opções...

  if (variant === "inline") {
    return <LoadingSpinner size={size} />;
  }

  if (variant === "button") {
    return (
      <span className="d-inline-flex align-items-center">
        <LoadingSpinner size={size} />
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <div
        className="position-absolute top-0 start-0 w-100 h-100 
        d-flex justify-content-center align-items-center 
        bg-white bg-opacity-75"
        style={{ zIndex: 100 }}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: height }}
    >
      <LoadingSpinner size={size} />
    </div>
  );
}