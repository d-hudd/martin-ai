// components/SaveNotification.jsx
const SaveNotification = ({ message, type = 'success' }) => {
  return (
    <div className={`
      fixed bottom-4 right-4 px-4 py-2 rounded-md text-sm
      ${type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
    `}>
      {message}
    </div>
  );
};