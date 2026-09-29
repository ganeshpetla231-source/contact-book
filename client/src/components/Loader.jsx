export default function Loader({ label = "Turning the page..." }) {
  return <div className="book-loader" role="status"><span className="loader-book">▯</span><span>{label}</span></div>;
}
