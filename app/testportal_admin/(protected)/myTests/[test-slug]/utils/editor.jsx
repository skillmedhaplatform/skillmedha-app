
'use client'
import React, { useState, useEffect } from "react";
import { EditorState, convertToRaw ,ContentState} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useDispatch, useSelector } from "react-redux";
import htmlToDraft from "html-to-draftjs";
import { setFormValues, updatingVals } from "@/redux/slices/testportal_admin/slice/stepform";
import { usePathname } from "next/navigation";
import { decryptObject } from "@/app/student/(protected)/tests/utils/encrytionMiddleware";
import { getSstorage } from "@/utils/universalUtils/windowMW";
import { setQuestionVals } from "@/redux/slices/testportal_admin/slice/questions";


const EditorComp = ({name,answers}) => {
    const dispatch = useDispatch()
    const currPath = usePathname()

    const SingleTest = decryptObject(getSstorage('selectedTest'),getSstorage('testId'))

    const SingleQuestion = decryptObject(getSstorage('questionObj'),getSstorage('quesId'))

  const values = useSelector((state)=>state.steps.value)

  const questionVals = useSelector((state)=>state.questions.questionVals)
  const updatingValState = useSelector((state)=>state.steps.updatingVals)

  const [editorState, setEditorState] = useState(EditorState.createEmpty() );
  const [editorValue, setEditorValue] = useState("");

  const content = JSON.stringify(editorValue);


  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
  };

 
  useEffect(() => {

    const draft = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setEditorValue( draft);
    
    if(currPath.split("/")[currPath.split("/")?.length -1] == "questionManager" ){
      if(name == "explanation"){
        dispatch(setQuestionVals({...questionVals,[name] : content}))

      }else{

        dispatch(setQuestionVals({...questionVals,questionContent:{...questionVals.questionContent, [name] :content,answers :{value : answers}}}))
      }
      
      
      }
      else if(currPath.split("/")[currPath.split("/")?.length -1] == "startPage" ){
        dispatch(updatingVals({...updatingValState,startPage : {...updatingValState.startPage , [name] : content}}))
      } 
      else if(currPath.split("/")[currPath.split("/")?.length -1] == "grading" ){
        dispatch(updatingVals({...updatingValState,grading : {...updatingValState.grading , [name] : content}}))
      } 
      else{

      dispatch(setFormValues({...values,[name] : content}))
    }


  }, [editorState,answers?.length]);



  useEffect(()=>{
    if(currPath.split("/")[currPath.split("/")?.length -1] == "questionManager"  && SingleTest?._id){

      if(name !== 'explanation'){
 

        const parsed = JSON.parse(SingleQuestion?.questionContent[name])
        const contentBlocks = htmlToDraft(parsed)
  
        const contentState = ContentState.createFromBlockArray(
            contentBlocks.contentBlocks
          );
          const newEditorState = EditorState.createWithContent(contentState);
          setEditorState(newEditorState);
      }
      else if(name == "explanation" && SingleQuestion?.answers?.explanation){
        const parsed = JSON.parse(SingleQuestion?.answers?.explanation)
        const contentBlocks = htmlToDraft(parsed)
  
        const contentState = ContentState.createFromBlockArray(
            contentBlocks.contentBlocks
          );
          const newEditorState = EditorState.createWithContent(contentState);
          setEditorState(newEditorState);
      }
     
    }
  
    else if(currPath.split("/")[currPath.split("/")?.length -1] == "about" && SingleTest?._id){
   
        const parsed = JSON.parse(SingleTest[name])
        const contentBlocks = htmlToDraft(parsed)

        const contentState = ContentState.createFromBlockArray(
            contentBlocks.contentBlocks
          );
          const newEditorState = EditorState.createWithContent(contentState);
          setEditorState(newEditorState);
    }
    
  
  },[])


  return (
      <Editor
        editorState={editorState}
        wrapperClassName="wrapper-class"
        editorClassName="editor-class"
        toolbarClassName="toolbar-class"
        onEditorStateChange={onEditorStateChange}
      />

  );
};

export default EditorComp;