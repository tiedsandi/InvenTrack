import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const base = Swal.mixin({
    confirmButtonColor: "#0f172a",
    cancelButtonColor: "#000000",
    customClass: {
        cancelButton: "!text-slate-700",
        popup: "!rounded-2xl !shadow-xl",
        title: "!text-slate-800 !text-lg !font-semibold",
        htmlContainer: "!text-slate-500 !text-sm",
        confirmButton: "!rounded-xl !font-medium !text-sm !px-5 !py-2",
        cancelButton: "!rounded-xl !font-medium !text-sm !px-5 !py-2",
    },
    buttonsStyling: true,
    reverseButtons: true,
});

export async function confirmDelete(nama = "item ini") {
    const result = await base.fire({
        title: "Hapus data?",
        html: `Data <strong>${nama}</strong> akan dihapus permanen dan tidak bisa dikembalikan.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
        confirmButtonColor: "#ef4444",
    });
    return result.isConfirmed;
}

export function toastSuccess(message) {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
            popup: "!rounded-xl !shadow-lg !text-sm",
            title: "!text-slate-700 !text-sm !font-medium",
        },
    });
}

export function toastError(message) {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        customClass: {
            popup: "!rounded-xl !shadow-lg",
            title: "!text-slate-700 !text-sm !font-medium",
        },
    });
}
