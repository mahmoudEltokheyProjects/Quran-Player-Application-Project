    /* get the <audio></audio> element */
let audioElem = document.querySelector(".quranPlayer") ,
    /* get the  <div class="surahs"></div> element */
    surhasContainerElem = document.querySelector(".surahs"),
    /* get the  <div class="ayah"></div> element */
    ayahTxtElem = document.querySelector(".ayah"),
    /* get "audio buttons" such as "prev" , "play" , "next"  */
    prevElem = document.querySelector(".prev"),
    playElem = document.querySelector(".play"),
    nextElem = document.querySelector(".next");

/* ++++++++++++++++++++++ Create "getSurahs" Function ++++++++++++++++++++++ */
//  هذه الدالة هترجع لي كل السور 
function getSurahs()
{   
    // Fetch To Get Surahs data : call "Quran Audio Api"
    // fetch( Api_Url , Methods[Get or Post] ) : data والمعامل الثاني هو الدالة اللي هجيب بيها ال data اللي هجيب منها ال Api المعامل الاول هو هبعت لها لينك ال
    // console في ال data ثم هطبع ال json format الي response فهحول ال response فهيرجع لي  http request فهيتم عمل Api علي اللينك بتاع ال request هعمل
    // we can use file of Api from your device or from link , "quran-api.json" == "https://quran-endpoint.vercel.app/quran" is the link of Api
    fetch("quran-api.json")
    .then( response => response.json() )
    .then( data => { 
            /* ++++++++++++++++++++ create "surahs divs" هجيب كل السور وهحط كل سورة في ديف داخل الديف الاب ++++++++++++++++++++ */
            for( let surahVar in data.data )
            {

                surhasContainerElem.innerHTML += 
                ` 
                    <div>
                        <!-- "surah" in "arabic language" -->
                        <p> ${data.data[surahVar].asma.ar.long} </p>
                        <!-- "surah" in "english language" -->
                        <p> ${data.data[surahVar].asma.en.long} </p>
                    </div>                  
                `
            }
            /* ++++++++++++++++++++ هجيب كل الديفات بتاع السور وهحزنها في متفير حيث هيكون فيه 114 عنصر ++++++++++++++++++++ */
            let allSurahs  = document.querySelectorAll(".surahs div");
            /* loop on all surahs */
            allSurahs.forEach((surahElem , surahIndex) => {
                // "surahElem" will be <div></div>
                surahElem.addEventListener("click",function(e){
                    // will get each "surah" start from index=1 where "https://quran-endpoint.vercel.app/quran/1" is the "first surah" "سورةالفاتحة"
                    fetch(`https://quran-endpoint.vercel.app/quran/${ surahIndex + 1 }`)
                    .then( response => response.json())
                    .then( data => {
                        //  ayahs اسمه attribute عشان اجيب كل ايات السورة اللي هضغط عليها عن طريق ال 
                        let ayahSurah = data.data.ayahs,
                            // هخزن كل ملف الصوت لكل اية في السورة في مصفوفة
                            ayahsAudioArr = [] ,
                            // هخزن النص  لكل اية في السورة في مصفوفة
                            ayahsTextArr = [] ;
                        ayahSurah.forEach(ayahTxtVar => {
                            // هخزن كل ملف صوت لكل اية في السورة في مصفوفة
                            ayahsAudioArr.push(ayahTxtVar.audio.url);
                            // هخزن النص  لكل اية في السورة في مصفوفة
                            ayahsTextArr.push(ayahTxtVar.text.ar);
                        });
                        /* ----------------- add class "activeSurah" to "clicked surah"  ----------------- */
                        let ayahIndex = 0 ;
                        // +++++++++++++++++ call"changeAyah" function +++++++++++++++++
                        changeAyah(ayahIndex);
                        /* عشان كل لما ملف الصوت بتاع كل اية يصل للنهاية يجيب الاية اللي بعدها */
                        audioElem.addEventListener("ended",function(){
                            ayahIndex++ ;
                            //  ayahsAudioArr or ayahsTextArr بتاع المصفوفة سواء ال range فهيكون خارج ال  ayahIndex لان ممكن بعد ما السورة كلها تخلص وازود  ayahIndex علي ال check لازم اعمل 
                            // ayahsAudioArr.length == ayahsTextArr.length
                            if( ayahIndex < ayahsAudioArr.length )
                            {
                                // +++++++++++++++++ call"changeAyah" function : هيستدعي الدالة ayahsAudioArr or ayahsTextArr بتاع المصفوفة سواء ال range داخل ال ayahIndex طول ما ال +++++++++++++++++
                                changeAyah(ayahIndex);
                            }
                            else
                            {
                                // rest the "ayahIndex" to default value
                                ayahIndex = 0 ;
                                // stop audio from playing
                                audioElem.pause();
                                // sweatAleart
                                Swal.fire({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Surah has been Ended',
                                    showConfirmButton: false,
                                    timer: 1500
                                })
                                //  play() ل pause() هتتحول من  play لما السورة تخلص فعلامة ال
                                isPlaying=true;
                                togglePlay();
                            }
                        })
                        /*  <audio></audio>  بتاع ال src attr هحط ملف الصوت بتاع اول اية في سورة الفاتحة كقيمة لل   */
                        audioElem.src = ayahsAudioArr[ayahIndex];
                        /*  <div class="ayah"></div>  بتاع ال innerHtml هحط نص الاية بتاع اول اية في سورة الفاتحة كقيمة لل   */
                        ayahTxtElem.innerHTML = ayahsTextArr[ayahIndex];
                        /* +++++++++++++++++++++++++++++++ When Click on "next" button : هيجيب الاية اللي بعدها  +++++++++++++++++++++++++++++++ */
                        nextElem.addEventListener("click",function(){
                            if( ayahIndex < ayahsAudioArr.length-1 )
                            {
                                ayahIndex++;
                                changeAyah(ayahIndex);
                            }
                            else
                            {
                                ayahIndex=0;
                            }

                        });
                        /* +++++++++++++++++++++++++++++++ When Click on "prev" button : هيجيب الاية اللي قبلها  +++++++++++++++++++++++++++++++ */
                        prevElem.addEventListener("click",function(){
                            if( ayahIndex > 0 )
                            {
                                ayahIndex-- ;
                                changeAyah(ayahIndex);
                            }
                            else
                            {
                                ayahIndex = ayahsAudioArr.length-1 ;
                            }

                        });
                        /* +++++++++++++++++++++++++ handle "Play" And "Pause" Audio icon  +++++++++++++++++++++++++ */
                        // في البداية مش بيكون شغال audio لان ال
                        let isPlaying = false ;
                        // call togglePlay()
                        togglePlay();
                        // ++++++++++++++++++++++++ toggle between "Play" and "Pause" +++++++++++++++++++++++ 
                        //شغال ولا لاه audio فهعمل دالة هشوف هل ال play هذه الدالة مش هتشتغل إلا لما اضغط علي زرار ال
                        function togglePlay()
                        {
                            // play icon هتتغير الي play هيتوقف والايقون بتاع ال audio فال play شغال فلما اضغط علي زرار ال audio لو ال
                            if( isPlaying == true )
                            {
                                audioElem.pause();
                                playElem.innerHTML = `<i class='fa fa-play'></i>`;
                                // هيتوقف audio وال pause الي audio icon هيغير ال play هيكون شغال فلما اضغط علي زرار ال audio ال
                                isPlaying = false;
                            }
                            else
                            {
                                // pause icon هتتغير الي play هيشتغل والايقون بتاع ال audio فال play مش شغال فلما اضغط علي زرار ال audio لو ال
                                audioElem.play();
                                playElem.innerHTML = '<i class="fa fa-pause"></i>';
                                isPlaying = true ;
                            }
                        }
                        // when click on "play" button , the "togglePlay()" function will implement
                        playElem.addEventListener("click",togglePlay);
                        // ++++++++++++++++++++++++++++++++++ create "changeAyah" function ++++++++++++++++++++++++++++++++++
                        function changeAyah(indexVar)
                        {
                            /* عشان كل لما اية تخلص يجيب الاية اللي بعدها */
                            audioElem.src = ayahsAudioArr[indexVar];
                            ayahTxtElem.innerHTML = ayahsTextArr[indexVar];
                        }

                    });
                });
            });
        });
}
/* ++++++++++++++++++++++ Call "getSurahs" Function ++++++++++++++++++++++ */
getSurahs();
