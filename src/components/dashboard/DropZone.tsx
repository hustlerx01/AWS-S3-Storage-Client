return `${mb.toFixed(1)} MB/s`;
    } else if (kb >= 1) {
    return `${kb.toFixed(1)} KB/s`;
} else {
    return `${bytesPerSecond.toFixed(0)} B/s`;
}
}

function formatTime(seconds: number): string {
    if (seconds < 1) return '< 1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    if (minutes < 60) {
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}
