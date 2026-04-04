const variants = {
    pending:   'bg-yellow-100 text-yellow-700',
    received:  'bg-green-100 text-green-700',
    shipped:   'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    default:   'bg-gray-100 text-gray-700',
};

export default function Badge({ status }) {
    const className = variants[status] ?? variants.default;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${className}`}>
            {status}
        </span>
    );
}
