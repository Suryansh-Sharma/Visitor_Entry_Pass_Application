package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.exception.SpringVisitorException;
import com.suryansh.visitorentry.service.interfaces.FileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * This Service class is used for performing file related operation.
 *
 * @author suryansh
 */
@Service
public class FileServiceImpl implements FileService {
    @Value("${folder.images}")
    private String FOLDER_PATH;
    private final static Logger logger = LoggerFactory.getLogger(FileServiceImpl.class);

    // MultipartFile.transferTo(File) resolves a *relative* destination against the
    // servlet container's own temp/work directory, not the app's working directory —
    // so folder.images's relative default (../User_Images/) must be made absolute
    // before use, or uploads silently land inside Tomcat's temp dir instead.
    private File resolve(String fileName) {
        Path absoluteFolder = Path.of(FOLDER_PATH).toAbsolutePath().normalize();
        return absoluteFolder.resolve(fileName).toFile();
    }

    public String addNewImage(MultipartFile file, String imageName) {
        if (file.isEmpty()){
            throw new SpringVisitorException("Image is empty", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST);
        }
        if (imageName.isEmpty()){
            throw new SpringVisitorException("Image name is empty", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST);
        }
        File newFile = resolve(imageName);
        try {
            file.transferTo(newFile);
            logger.info("New Image {} is added successfully", imageName);
            return imageName;
        } catch (Exception e) {
            logger.error("Unable to add new image file: {}", e.toString());
            throw new SpringVisitorException("Unable to update file", ErrorType.INTERNAL_ERROR, HttpStatus.BAD_REQUEST);
        }
    }

    public byte[] getImage(String name) throws IOException {
        File file = resolve(name);
        if (!file.exists()) throw new SpringVisitorException("Unable to find image of name " + name,ErrorType.NOT_FOUND,HttpStatus.NOT_FOUND);
        return Files.readAllBytes(file.toPath());
    }

    @Override
    public void handleUpdateImage(String name, MultipartFile file) {
        if (file.isEmpty()) {
            throw new SpringVisitorException("Image is empty", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST);
        }
        if (name.isEmpty()) {
            throw new SpringVisitorException("Image name is empty", ErrorType.NOT_FOUND, HttpStatus.BAD_REQUEST);
        }
        File oldFile = resolve(name);

        try {
            if (oldFile.exists()) {
                boolean deleted = oldFile.delete();
                if (!deleted) {
                    throw new SpringVisitorException("Failed to delete the old image",
                            ErrorType.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            File newFile = resolve(name);
            file.transferTo(newFile);

        } catch (IOException e) {
            logger.error("Error while updating the image: {}", e.getMessage());
            throw new SpringVisitorException("Error while updating the image", ErrorType.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public boolean checkFileExist(String visitorImage) {
        return resolve(visitorImage).exists();
    }

}
