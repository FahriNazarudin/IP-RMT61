export default function Button(props) {
  const { title, type = "button", onClick, variant = "primary" } = props;
  const className = `btn btn-${variant} `;

  return (
    <button type={type} className={className} onClick={onClick}>
      {title}
    </button>
  );
}
