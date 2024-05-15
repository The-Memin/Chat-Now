import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import useKeypress from 'react-use-keypress';
const socket = io('/')
interface Message {
    body: string;
    from: string;
}

const App: React.FC = ()=> {
    const [message, setMessage] = useState<string>('')
    const [messages, setMessages] = useState<Message[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dotsRef = useRef<HTMLLIElement>(null);
    const doneTypingInterval: number = 1000;
    let typingTimer: any;
    


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>):void=>{
        e.preventDefault()

        const newMessage: Message = {
            body: message,
            from: 'Me',
        }
        setMessages([...messages, newMessage])
        socket.emit('message', message);

        if (textareaRef.current) {
            textareaRef.current.value = '';
        }
    }

    useEffect(()=>{
        socket.on('message',receiveMessage)
        socket.on('writing',writing)
        socket.on('writing-stop',writingStop)

        if (textareaRef.current) {
            textareaRef.current.addEventListener('keyup', () => {
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    socket.emit('writing-stop');
                }, doneTypingInterval);
            });
        }
        return ()=>{
            socket.off('message',receiveMessage)
            socket.off('writing',writing) 
            socket.off('writing-stop',writingStop)
        }
    },[])

    useEffect(()=>{
        if (message != '') {
            socket.emit('writing');
        }
    },[message])

    useKeypress('Enter', (e:any) => {
        handleSubmit(e);
    });


    const receiveMessage = (message: Message) =>{
        writingStop();
        setMessages((state: Message[])=>[...state, message])
    }

    const writing = ()=>{
        if (dotsRef.current) {
            dotsRef.current.classList.add('active');
        }
    }

    const writingStop = ()=>{
        if (dotsRef.current) {
            dotsRef.current.classList.remove('active');
        }
    }

    return (
        <div className="h-screen bg-zinc-800 text-white flex flex-col items-center justify-center py-20">

            <main className="flex flex-col w-11/12 md:w-9/12 lg:w-6/12 justify-between h-full max-h-full">
                <h1 className="text-2xl font-bold">Chat with react</h1>

                <section className="flex flex-col gap-5 h-full max-h-full justify-end">

                    <ul className="w-full flex flex-col-reverse h-full overflow-y-scroll px-10">
                        <li ref={dotsRef} className={"li-writing flex items-center gap-1 h-7 my-2 p-2 text-sm rounded-md w-fit bg-gray-700 px-5"}>
                            <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                        </li>
                        {
                            messages.slice().reverse().map((message: Message , i: number)=>
                                <li className={`my-2 p-2 table text-sm rounded-md w-fit ${message.from==='Me'?"bg-sky-600 ml-auto":"bg-gray-700"}`} key={i}>
                                <span className="text-xs text-slate-300 block">{message.from} </span>
                                {message.body}
                                </li>
                            )
                        }
                    </ul>

                    <form onSubmit={handleSubmit} className="overflow-hidden [&:has(textarea:focus)]:border-token-border-xheavy [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] flex flex-col w-full flex-grow relative border dark:text-white rounded bg-token-main-surface-primary border-token-border-medium">
                        <textarea ref={textareaRef} className="m-0 w-full resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 bg-zinc-900 py-[10px] pr-10 md:py-3.5 md:pr-12 max-h-[25dvh] placeholder-black/50 dark:placeholder-white/50 pl-4 md:pl-6"  placeholder="Write your message ..."
                            onChange={(e)=>{setMessage(e.target.value)}}/>
                        <button className="group absolute bottom-1.5 right-2 rounded-full border border-black bg-black p-2 text-white transition-colors enabled:bg-black disabled:text-gray-400 disabled:opacity-10 dark:border-white dark:bg-white dark:hover:bg-white md:bottom-3 md:right-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path className="fill-white group-hover:fill-gray-700" d="m21.426 11.095-17-8A.999.999 0 0 0 3.03 4.242L4.969 12 3.03 19.758a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81zM5.481 18.197l.839-3.357L12 12 6.32 9.16l-.839-3.357L18.651 12l-13.17 6.197z"></path></svg></button>
                    </form>
                </section>

            </main>
        </div>
    )
}

export default App
