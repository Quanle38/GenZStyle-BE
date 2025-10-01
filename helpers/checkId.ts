const parseId = (id : string) => {
    let response : string | number = id;
    const key = ["address_id", "id", "condition_id", "favorite_id"]
        key.forEach(element => {
            if (id === element){
                response = Number(id);
            }
    });
    return response
}
export default parseId;