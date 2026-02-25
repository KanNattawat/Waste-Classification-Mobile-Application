export const getDowloadPresigned = async (token: string | undefined, query: string) => {
    console.log(query)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/manage/s3-multi-presigned?${query}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    const data = await res.json()
    console.log(data.url)
    return data.url
}


export const getZipFile = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'waste-export.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
}

export const getImage = (url:string)=>{
    return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${url}`
}