export const formatMilisToText = (time: number) => {
    const minute = Math.floor(time / 60000).toString().padStart(2, '0');
    const second = Math.floor(((time / 60000) % 1) * 60).toString().padStart(2, '0');
    
    return `${minute}:${second}`;
}
