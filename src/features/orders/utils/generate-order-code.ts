export function generateOrderCode(){
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth()+1).padStart(2,"0");
    const day = String(now.getDate()).padStart(2,"0");
    const random = String(Math.floor(Math.random()*999)).padStart(3,"0");

    return `SO-${year}${month}${day}-${random}`;
}