//upload input file
function uploadFile() {
  console.log("file uploaded!");
  //   //TODO - integrate the converting logic here
}

//Run button's onclick event
function runFunc() {
  console.log("run button is clicked");

  var fileInfo3 = document.getElementById("fileInfo");
  if (fileInfo3) {
    fileInfo3.innerHTML = "<div></div>";
  }

  //trigger GP service
  require(["esri/tasks/Geoprocessor", "esri/rest/support/JobInfo"], (
    Geoprocessor,
    JobInfo
  ) => {
    // console.log("before gp def");
    var gp = new Geoprocessor(
      // "https://mygis.engeo.com/server/rest/services/CAF_23777/siteacessemailto/GPServer/siteacessemailto/" //for the "site access mail to" GP task
      "https://mygis.engeo.com/server/rest/services/APIs/eddconvertor2/GPServer/EDD%20Converter"
    );

    //define the input parameters
    // TODO - check for the input EDD type?
    if (inputfileString && EDDType) {
      //NO NEED - wrap the params into one combined input as a nested JSON object
      // var paramsCombined = {
      //   input: {
      //     Type_of_EDD: EDDType, //EDDType: the type the user selects on the webpage
      //     EDD_Table: inputfileString, //inputfileString: the parsed string from the input excel file
      //   },
      // };

      var params = {
        Type_of_EDD: EDDType,
        EDD_Table: inputfileString,
      };

      console.log("input params: ", params);

      //TODO - ORIGINAL
      //IMPORTANT - [params] is INCORRECT! problematic!!! https://enterprise.arcgis.com/en/server/10.8/publish-services/windows/using-geoprocessing-tasks-in-web-applications.htm
      gp.submitJob(params)

        // gp.submitJob(paramsCombined)

        .then(function (jobInfo) {
          console.log("after submit job - job info: ", jobInfo);

          var progressDiv = document.createElement("div");
          progressDiv.setAttribute("id", "progressText");
          progressDiv.innerText = "Task is running ... ";
          progressDiv.style.margin = "5px 15px 5px";
          progressDiv.style.fontSize = "1.0em";
          progressDiv.style.textAlign = "center";
          document.getElementsByTagName("div")[0].appendChild(progressDiv);

          var runButton = document.getElementById("runButtonID");
          runButton.style.background = "grey";
          runButton.style.border = "grey";
          // runButton.insertAdjacentElement("afterend", progressDiv);

          // console.log("mid submit - job info: ", jobInfo);

          const options = {
            interval: 50, //wait for 0.05 sec
            statusCallback: (j) => {
              console.log("Job Status: ", j.jobStatus); //actually this keeps running!
            },
          };

          // console.log("after options and before waitforjob complete");

          // wait for the job to complete - produces generic error
          jobInfo
            .waitForJobCompletion(options)
            .then(() => {
              console.log("job completed");
              if (progressDiv) {
                progressDiv.remove();
              }
              // //show the emails
              jobInfo
                .fetchResultData(
                  "output2" //this is output variable name
                )
                .then(function (result) {
                  console.log("job result:", result.value);

                  runButton.innerText = "Download";
                  runButton.style.background = "#0054A4";
                  runButton.style.border = "#0054A4";
                  //click the button to generate and download the output excel file
                  //TODO - Convert json string to excel - https://stackoverflow.com/questions/28892885/javascript-json-to-excel-file-download
                  runButton.onclick = function () {
                    console.log("download clicked");
                    window.open(
                      result.value,
                      "_blank",
                      "location=yes,height=570,width=520,scrollbars=yes,status=yes"
                    );
                  };
                });
            })
            .catch((error) => {
              console.log("error during execution: ", error);
              console.log(
                "error during execution stringify: ",
                JSON.stringify(error)
              );
            });

          // catch error
        })
        .catch(function (e) {
          console.log("GP job failed", e);
        });

      console.log("GP service job submitted");
    }
  });
}
